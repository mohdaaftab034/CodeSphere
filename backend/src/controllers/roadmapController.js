import Roadmap from '../models/Roadmap.js';
import RoadmapNode from '../models/RoadmapNode.js';
import { createBasePDF, renderMarkdownToPDF, finalizePDF, renderInlineMarkdown } from '../utils/pdfHelpers.js';
import { sendRoadmapPublishedNotification } from '../utils/notificationService.js';

const frontendUrl = process.env.FRONTEND_URL || ""
const frontendBaseUrl = frontendUrl.replace(/\/$/, "")

// @desc    Get all roadmaps
// @route   GET /api/roadmaps
// @access  Public
export const getRoadmaps = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status && req.query.status !== 'all') {
            if (req.query.status === 'published') {
                filter.status = { $in: ['published', null] };
            } else {
                filter.status = req.query.status;
            }
        } else if (!req.query.status) {
            filter.status = { $in: ['published', null] };
        }

        const roadmaps = await Roadmap.find(filter).sort({ createdAt: -1 });
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single roadmap
// @route   GET /api/roadmaps/:id
// @access  Public
export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);
        if (roadmap) {
            res.json(roadmap);
        } else {
            res.status(404).json({ message: 'Roadmap not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a roadmap
// @route   PUT /api/roadmaps/:id
// @access  Private/Admin
export const updateRoadmap = async (req, res) => {
    try {
        const { title, description, slug, icon, color, status } = req.body;
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const oldStatus = roadmap.status;
        if (title !== undefined) roadmap.title = title;
        if (description !== undefined) roadmap.description = description;
        if (slug !== undefined) roadmap.slug = slug;
        if (icon !== undefined) roadmap.icon = icon;
        if (color !== undefined) roadmap.color = color;
        if (status !== undefined) roadmap.status = status;

        const updatedRoadmap = await roadmap.save();

        // Send notification if status changed to 'published'
        if (oldStatus !== 'published' && updatedRoadmap.status === 'published') {
            try {
                const roadmapUrl = `${frontendBaseUrl}/roadmaps/${updatedRoadmap._id}`
                await sendRoadmapPublishedNotification(updatedRoadmap, roadmapUrl)
            } catch (notificationError) {
                console.error("⚠️ Failed to send roadmap notification:", notificationError.message)
            }
        }

        res.json(updatedRoadmap);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a roadmap and its nodes
// @route   DELETE /api/roadmaps/:id
// @access  Private/Admin
export const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        await RoadmapNode.deleteMany({ roadmapId: roadmap._id });
        await Roadmap.deleteOne({ _id: roadmap._id });

        res.json({ message: 'Roadmap and nodes removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a roadmap
// @route   POST /api/roadmaps
// @access  Private/Admin
export const createRoadmap = async (req, res) => {
    try {
        const { title, description, slug, icon, color, status } = req.body;
        const roadmap = new Roadmap({
            title,
            description,
            slug,
            icon,
            color,
            status: status || 'draft',
        });
        const createdRoadmap = await roadmap.save();

        // Send notification if roadmap is published
        if (createdRoadmap.status === 'published') {
            try {
                const roadmapUrl = `${frontendBaseUrl}/roadmaps/${createdRoadmap._id}`
                await sendRoadmapPublishedNotification(createdRoadmap, roadmapUrl)
            } catch (notificationError) {
                console.error("⚠️ Failed to send roadmap notification:", notificationError.message)
            }
        }

        res.status(201).json(createdRoadmap);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Publish all draft roadmaps
// @route   POST /api/roadmaps/publish-drafts
// @access  Private/Admin
export const publishDraftRoadmaps = async (req, res) => {
    try {
        const roadmapResult = await Roadmap.updateMany({ status: 'draft' }, { status: 'published' });
        const nodeResult = await RoadmapNode.updateMany(
            { status: 'draft' },
            { status: 'published' }
        );

        res.json({
            message: 'Draft roadmaps and nodes published',
            roadmapsPublished: roadmapResult.modifiedCount,
            nodesPublished: nodeResult.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all nodes for a roadmap
// @route   GET /api/roadmaps/:id/nodes
// @access  Public
export const getRoadmapNodes = async (req, res) => {
    try {
        const filter = { roadmapId: req.params.id };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const nodes = await RoadmapNode.find(filter).sort({ order: 1 });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a roadmap node
// @route   POST /api/roadmaps/nodes
// @access  Private/Admin
export const createRoadmapNode = async (req, res) => {
    try {
        const { roadmapId, parentId, title, description, order, status, resourceLink } = req.body;

        // If order is not provided, put it at the end
        let nodeOrder = order;
        if (nodeOrder === undefined) {
            const lastNode = await RoadmapNode.findOne({ roadmapId, parentId }).sort({ order: -1 });
            nodeOrder = lastNode ? lastNode.order + 1 : 0;
        }

        const node = new RoadmapNode({
            roadmapId,
            parentId: parentId || null,
            title,
            description,
            order: nodeOrder,
            status: status || 'draft',
            resourceLink,
        });

        const createdNode = await node.save();
        res.status(201).json(createdNode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a roadmap node
// @route   PUT /api/roadmaps/nodes/:id
// @access  Private/Admin
export const updateRoadmapNode = async (req, res) => {
    try {
        const { title, description, parentId, order, status, resourceLink } = req.body;
        const node = await RoadmapNode.findById(req.params.id);

        if (node) {
            node.title = title || node.title;
            node.description = description !== undefined ? description : node.description;
            if (resourceLink !== undefined) node.resourceLink = resourceLink;
            if (parentId !== undefined) node.parentId = parentId || null;
            if (order !== undefined) {
                node.order = order;
            } else if (parentId !== undefined) {
                const lastSibling = await RoadmapNode.findOne({ roadmapId: node.roadmapId, parentId: node.parentId })
                    .sort({ order: -1 });
                node.order = lastSibling ? lastSibling.order + 1 : 0;
            }
            if (status !== undefined) node.status = status;

            const updatedNode = await node.save();
            res.json(updatedNode);
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Reorder roadmap nodes
// @route   POST /api/roadmaps/:id/nodes/reorder
// @access  Private/Admin
export const reorderRoadmapNodes = async (req, res) => {
    try {
        const { nodes } = req.body;
        if (!Array.isArray(nodes)) {
            return res.status(400).json({ message: 'nodes must be an array' });
        }

        const ops = nodes.map((n) => ({
            updateOne: {
                filter: { _id: n.id, roadmapId: req.params.id },
                update: { parentId: n.parentId || null, order: n.order },
            },
        }));

        if (ops.length === 0) {
            return res.json({ message: 'No changes' });
        }

        await RoadmapNode.bulkWrite(ops);
        res.json({ message: 'Reordered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a roadmap node
// @route   DELETE /api/roadmaps/nodes/:id
// @access  Private/Admin
export const deleteRoadmapNode = async (req, res) => {
    try {
        const node = await RoadmapNode.findById(req.params.id);

        if (node) {
            const collectDescendants = async (parentIds, ids = []) => {
                const children = await RoadmapNode.find({ parentId: { $in: parentIds } }, { _id: 1 });
                if (children.length === 0) return ids;
                const childIds = children.map((c) => c._id);
                ids.push(...childIds);
                return collectDescendants(childIds, ids);
            };

            const descendantIds = await collectDescendants([node._id]);
            await RoadmapNode.deleteMany({ _id: { $in: [node._id, ...descendantIds] } });

            res.json({ message: 'Node and children removed' });
        } else {
            res.status(404).json({ message: 'Node not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Download roadmap as PDF (Premium Feature)
// @route   GET /api/roadmaps/:id/download-pdf
// @access  Private
export const downloadRoadmapAsPDF = async (req, res) => {
    try {
        const { id } = req.params;

        // Premium Check
        if (!req.user || (!req.user.isPaid && req.user.role !== 'admin')) {
            return res.status(403).json({
                message: 'Premium subscription required to download roadmap as PDF',
                isPremiumRequired: true
            });
        }

        const roadmap = await Roadmap.findById(id);
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const nodes = await RoadmapNode.find({ roadmapId: id, status: 'published' }).sort({ order: 1 });

        // Create PDF document using helper
        const doc = createBasePDF(roadmap.title);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${roadmap.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-roadmap.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(28).font('Helvetica-Bold').fillColor('#0066cc').text(roadmap.title, { align: 'left' });
        doc.moveDown(0.2);

        doc.fontSize(12).font('Helvetica').fillColor('#666666').text(roadmap.description, { width: 500 });
        doc.moveDown(1);

        // Add separator line
        doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1.5);

        // Helper for recursive nodes (optional, but roadmaps are often trees)
        // Here we just render them in order if they are not explicitly tree-structured in the DB

        // Render nodes
        nodes.forEach((node, index) => {
            // Check for page break
            if (doc.y > doc.page.height - 100) {
                doc.addPage();
            }

            // Node title
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a1a1a');
            doc.text(`${index + 1}. ${node.title}`, { width: 500 });
            doc.moveDown(0.3);

            // Node description
            if (node.description) {
                doc.fontSize(11).font('Helvetica').fillColor('#444444');
                renderMarkdownToPDF(doc, node.description);
                doc.moveDown(0.5);
            }

            // Resource link
            if (node.resourceLink) {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#0066cc');
                doc.text('Resource: ', { continued: true }).font('Helvetica').text(node.resourceLink, { link: node.resourceLink });
                doc.moveDown(1);
            }

            // Node separator
            if (index < nodes.length - 1) {
                doc.moveDown(1.5);
            }
        });

        // Finalize with numbering and footer
        finalizePDF(doc, roadmap.title);

        doc.end();
    } catch (error) {
        console.error('Roadmap PDF generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
        } else {
            res.end();
        }
    }
};

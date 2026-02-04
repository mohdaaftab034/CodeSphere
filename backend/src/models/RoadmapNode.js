import mongoose from 'mongoose';

const roadmapNodeSchema = new mongoose.Schema({
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true,
        index: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoadmapNode',
        default: null,
        index: true, // Optimizes fetching children
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    // Optional: For leaf nodes that point to specific content
    resourceLink: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to help with ordering fetches
roadmapNodeSchema.index({ roadmapId: 1, parentId: 1, order: 1 });

const RoadmapNode = mongoose.model('RoadmapNode', roadmapNodeSchema);

export default RoadmapNode;

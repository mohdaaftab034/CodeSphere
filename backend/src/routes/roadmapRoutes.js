import express from 'express';
import {
    getRoadmaps,
    getRoadmapById,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    getRoadmapNodes,
    createRoadmapNode,
    updateRoadmapNode,
    deleteRoadmapNode,
    reorderRoadmapNodes,
    publishDraftRoadmaps,
    downloadRoadmapAsPDF,
} from '../controllers/roadmapController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getRoadmaps)
    .post(protect, adminOnly, createRoadmap);

router.route('/publish-drafts')
    .post(protect, adminOnly, publishDraftRoadmaps);

router.route('/:id/nodes')
    .get(getRoadmapNodes);

router.route('/:id/nodes/reorder')
    .post(protect, adminOnly, reorderRoadmapNodes);

router.route('/nodes')
    .post(protect, adminOnly, createRoadmapNode);

router.route('/:id/download-pdf')
    .get(protect, downloadRoadmapAsPDF);

router.route('/:id')
    .get(getRoadmapById)
    .put(protect, adminOnly, updateRoadmap)
    .delete(protect, adminOnly, deleteRoadmap);

router.route('/nodes/:id')
    .put(protect, adminOnly, updateRoadmapNode)
    .delete(protect, adminOnly, deleteRoadmapNode);

export default router;

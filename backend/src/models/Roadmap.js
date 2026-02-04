import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
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
    icon: {
        type: String, // e.g., 'Code2', 'Server' etc. to map to Lucide icons on frontend
        default: 'BookOpen',
    },
    color: {
        type: String, // e.g., 'text-blue-500'
        default: 'text-primary',
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;

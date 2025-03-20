import mongoose, { Schema } from 'mongoose';

const videoSchema = new Schema({
    muxUploadId: {
        type: String,
        required: true,
        unique: true,
    },
    muxAssetId: {
        type: String,
        required: false,
        // Remove unique constraint or make it sparse
        index: { unique: true, sparse: true }
    },
    playbackId: {
        type: String,
        required: false,
    },
    userId: {
        type: String,
        default: 'anonymous',
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'ready', 'error'],
        default: 'uploading',
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },likes: {
        type: Number,
        default: 0,
    },
});

// Make sure we're not redefining the model if it already exists
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;
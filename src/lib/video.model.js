import mongoose, { Schema } from 'mongoose';

const videoSchema = new Schema({
    muxAssetId: {
        type: String,
        required: true,
        unique: true, // Ensure each Mux Asset ID is unique in our DB
    },
    playbackId: {
        type: String, // Store the Mux Playback ID for easier access
    },
    userId: {
        type: String, // Basic user identification for now
        default: 'anonymous',
    },
    uploadDate: {
        type: Date,
        default: Date.now, // Automatically set upload date
    },
    // We can add more fields later, like title, description, etc.
});

// Define the model if it hasn't been defined yet, or use the existing one
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;
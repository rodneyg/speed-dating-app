import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  userId: {
    type: String,
    default: 'anonymous',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Make sure we're not redefining the model if it already exists
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;
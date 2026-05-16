const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,   // isolated per tenant just like tasks
      index: true,
    },
    taskId: {
      type: String,     // references _id of a Task document
      required: true,
      index: true,
    },
    userId: {
      type: String,     // references id of a User in PostgreSQL
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isEdited: {
      type: Boolean,
      default: false,   // track if comment was edited after posting
    },
  },
  {
    timestamps: true,
    collection: 'comments',
  }
);

// fetch all comments for a specific task fast
commentSchema.index({ tenantId: 1, taskId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
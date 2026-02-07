import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Video', 'Document', 'Quiz', 'Article', 'Other'],
      default: 'Document'
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Duration in minutes'
    },
    order: {
      type: Number,
      default: 0
    },
    url: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
contentSchema.index({ courseId: 1, order: 1 });

const Content = mongoose.model('Content', contentSchema);

export default Content;

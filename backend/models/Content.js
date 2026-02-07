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
      enum: ['video', 'document', 'image', 'article', 'quiz', 'presentation', 'infographic', 'Video', 'Document', 'Quiz', 'Article', 'Other'],
      default: 'document'
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
    },
    videoLink: {
      type: String,
      default: null
    },
    videoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      comment: 'GridFS file ID for uploaded video files (deprecated - use videoUrl)'
    },
    videoUrl: {
      type: String,
      default: null,
      comment: 'Direct URL to video file in cloud storage (S3, R2, etc.)'
    },
    storageKey: {
      type: String,
      default: null,
      comment: 'Storage key/path for video in cloud bucket'
    },
    fileUrl: {
      type: String,
      default: null
    },
    imageUrl: {
      type: String,
      default: null
    },
    allowDownload: {
      type: Boolean,
      default: false
    },
    responsible: {
      type: String,
      default: ''
    },
    attachmentUrl: {
      type: String,
      default: null
    },
    attachmentLink: {
      type: String,
      default: null
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

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    responsible: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: null
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lessonsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Duration stored in minutes'
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    shareLink: {
      type: String,
      default: null
    },
    visibility: {
      type: String,
      enum: ['everyone', 'signed_in'],
      default: 'everyone'
    },
    accessRules: {
      type: [String],
      enum: ['open', 'invitation', 'payment'],
      default: ['open']
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    responsibleUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for text search
courseSchema.index({ title: 'text' });

// Method to format duration as HH:MM
courseSchema.methods.getFormattedDuration = function() {
  const hours = Math.floor(this.totalDuration / 60);
  const minutes = this.totalDuration % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Method to generate share link
courseSchema.methods.generateShareLink = function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  this.shareLink = `${baseUrl}/course/${this._id}`;
  return this.shareLink;
};

const Course = mongoose.model('Course', courseSchema);

export default Course;

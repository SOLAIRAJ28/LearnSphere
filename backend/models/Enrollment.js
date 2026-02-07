import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    timeSpent: {
      type: Number,
      default: 0,
      comment: 'Time spent in minutes'
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['Yet to Start', 'In Progress', 'Completed'],
      default: 'Yet to Start'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paymentId: {
      type: String,
      default: null
    },
    amountPaid: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
enrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;

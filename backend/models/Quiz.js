import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [answerSchema],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const rewardSchema = new mongoose.Schema({
  correctPoints: {
    type: Number,
    default: 10
  },
  wrongPoints: {
    type: Number,
    default: 0
  },
  completionPoints: {
    type: Number,
    default: 50
  }
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  rewards: {
    type: rewardSchema,
    default: () => ({
      correctPoints: 10,
      wrongPoints: 0,
      completionPoints: 50
    })
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;

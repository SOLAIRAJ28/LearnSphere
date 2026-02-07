import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import { validationResult } from 'express-validator';

// @desc    Get all quizzes for a course
// @route   GET /api/courses/:courseId/quizzes
// @access  Public
export const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:quizId
// @access  Public
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// @desc    Create quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Public
export const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const quiz = await Quiz.create({
      courseId: req.params.courseId,
      title: req.body.title,
      questions: [],
      rewards: req.body.rewards || {
        correctPoints: 10,
        wrongPoints: 0,
        completionPoints: 50
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:quizId
// @access  Public
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (req.body.title) quiz.title = req.body.title;

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:quizId
// @access  Public
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await quiz.deleteOne();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

// @desc    Add question to quiz
// @route   POST /api/quizzes/:quizId/questions
// @access  Public
export const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = req.body.options?.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({
        success: false,
        message: 'At least one correct answer is required'
      });
    }

    const newQuestion = {
      questionText: req.body.questionText,
      options: req.body.options || [],
      order: quiz.questions.length
    };

    quiz.questions.push(newQuestion);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/quizzes/:quizId/questions/:questionId
// @access  Public
export const updateQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const question = quiz.questions.id(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = req.body.options?.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({
        success: false,
        message: 'At least one correct answer is required'
      });
    }

    if (req.body.questionText) question.questionText = req.body.questionText;
    if (req.body.options) question.options = req.body.options;

    await quiz.save();

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/quizzes/:quizId/questions/:questionId
// @access  Public
export const deleteQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    quiz.questions.pull(req.params.questionId);
    await quiz.save();

    res.json({
      success: true,
      message: 'Question deleted successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// @desc    Update quiz rewards
// @route   PUT /api/quizzes/:quizId/rewards
// @access  Public
export const updateRewards = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    quiz.rewards = {
      correctPoints: req.body.correctPoints ?? quiz.rewards.correctPoints,
      wrongPoints: req.body.wrongPoints ?? quiz.rewards.wrongPoints,
      completionPoints: req.body.completionPoints ?? quiz.rewards.completionPoints
    };

    await quiz.save();

    res.json({
      success: true,
      message: 'Rewards updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating rewards',
      error: error.message
    });
  }
};

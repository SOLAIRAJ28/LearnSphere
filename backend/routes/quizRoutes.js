import express from 'express';
import { body } from 'express-validator';
import {
  getCourseQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  updateRewards
} from '../controllers/quizController.js';

const router = express.Router();

// Quiz validation
const quizValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
];

// Quiz routes
router.get('/courses/:courseId/quizzes', getCourseQuizzes);
router.post('/courses/:courseId/quizzes', quizValidation, createQuiz);
router.get('/quizzes/:quizId', getQuiz);
router.put('/quizzes/:quizId', updateQuiz);
router.delete('/quizzes/:quizId', deleteQuiz);

// Question routes
router.post('/quizzes/:quizId/questions', addQuestion);
router.put('/quizzes/:quizId/questions/:questionId', updateQuestion);
router.delete('/quizzes/:quizId/questions/:questionId', deleteQuestion);

// Rewards route
router.put('/quizzes/:quizId/rewards', updateRewards);

export default router;

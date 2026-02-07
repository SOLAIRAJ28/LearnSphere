import express from 'express';
import {
  getParticipantCourses,
  getParticipantProfile,
  enrollInCourse,
  processCoursePayment,
  updateCourseProgress,
  markContentComplete,
  completeQuiz,
  getEnrollmentProgress
} from '../controllers/participantController.js';

const router = express.Router();

// Public routes (add authentication middleware later)
router.get('/courses', getParticipantCourses);
router.get('/profile/:userId', getParticipantProfile);
router.post('/courses/:id/enroll', enrollInCourse);
router.post('/courses/:id/pay', processCoursePayment);
router.put('/courses/:id/progress', updateCourseProgress);
router.put('/courses/:id/complete-content', markContentComplete);
router.put('/courses/:id/complete-quiz', completeQuiz);
router.get('/courses/:id/progress/:userId', getEnrollmentProgress);

export default router;

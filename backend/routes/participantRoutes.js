import express from 'express';
import {
  getParticipantCourses,
  getParticipantProfile,
  enrollInCourse,
  processCoursePayment,
  updateCourseProgress
} from '../controllers/participantController.js';

const router = express.Router();

// Public routes (add authentication middleware later)
router.get('/courses', getParticipantCourses);
router.get('/profile/:userId', getParticipantProfile);
router.post('/courses/:id/enroll', enrollInCourse);
router.post('/courses/:id/pay', processCoursePayment);
router.put('/courses/:id/progress', updateCourseProgress);

export default router;

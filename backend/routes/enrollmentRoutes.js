import express from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollmentProgress,
  deleteEnrollment
} from '../controllers/enrollmentController.js';

const router = express.Router();

// Get all enrollments with optional status filter
router.get('/', getEnrollments);

// Create enrollment
router.post('/', createEnrollment);

// Update enrollment progress
router.put('/:id', updateEnrollmentProgress);

// Delete enrollment
router.delete('/:id', deleteEnrollment);

export default router;

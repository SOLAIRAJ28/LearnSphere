import express from 'express';
import { body } from 'express-validator';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseTags,
  togglePublishCourse,
  generateShareLink
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const courseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
];

// Public routes (temporarily public for demo - add authentication later)
router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', courseValidation, createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.put('/:id/tags', updateCourseTags);
router.put('/:id/publish', togglePublishCourse);
router.post('/:id/share', generateShareLink);

// Protected routes (uncomment when authentication UI is ready)
// router.post('/', protect, admin, courseValidation, createCourse);
// router.put('/:id', protect, admin, updateCourse);
// router.delete('/:id', protect, admin, deleteCourse);
// router.put('/:id/tags', protect, admin, updateCourseTags);
// router.put('/:id/publish', protect, admin, togglePublishCourse);
// router.post('/:id/share', protect, admin, generateShareLink);

export default router;

import express from 'express';
import {
  getCourseContents,
  createContent,
  updateContent,
  deleteContent,
  reorderContents
} from '../controllers/contentController.js';

const router = express.Router();

// Content routes
router.get('/courses/:courseId/contents', getCourseContents);
router.post('/courses/:courseId/contents', createContent);
router.put('/courses/:courseId/contents/reorder', reorderContents);
router.put('/contents/:id', updateContent);
router.delete('/contents/:id', deleteContent);

export default router;

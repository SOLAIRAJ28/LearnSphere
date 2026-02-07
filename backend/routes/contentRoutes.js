import express from 'express';
import {
  getCourseContents,
  createContent,
  updateContent,
  deleteContent,
  reorderContents,
  uploadVideoContent,
  streamVideo,
  saveVideoMetadata,
  getContents
} from '../controllers/contentController.js';
import { uploadVideoToGridFS } from '../middleware/videoUpload.js';
import { getGridFSBucket } from '../config/gridfs.js';

const router = express.Router();

// Content routes
router.get('/courses/:courseId/contents', getCourseContents);
router.get('/contents', getContents); // NEW: Get contents by courseId query param
router.post('/courses/:courseId/contents', createContent);
router.post('/courses/:courseId/contents/video', uploadVideoToGridFS, uploadVideoContent);
router.post('/courses/:courseId/contents/video-metadata', saveVideoMetadata); // Cloud upload metadata
router.put('/courses/:courseId/contents/reorder', reorderContents);
router.put('/contents/:id', updateContent);
router.delete('/contents/:id', deleteContent);

// Video streaming route (GridFS videos)
router.get('/video/:fileId', streamVideo);

// Test route to verify GridFS connection
router.get('/video/test/status', (req, res) => {
  try {
    const bucket = getGridFSBucket();
    res.json({
      success: true,
      message: 'GridFS is connected and ready',
      bucketName: bucket.s.name || 'videos'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'GridFS not initialized',
      error: error.message
    });
  }
});

export default router;

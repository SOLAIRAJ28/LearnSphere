import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getCourseContents,
  createContent,
  updateContent,
  deleteContent,
  reorderContents,
  uploadVideoContent,
  streamVideo,
  saveVideoMetadata,
  getContents,
  uploadDocumentContent
} from '../controllers/contentController.js';
import { uploadVideoToGridFS } from '../middleware/videoUpload.js';
import { getGridFSBucket } from '../config/gridfs.js';

const router = express.Router();

// Document upload config
const docUploadDir = 'uploads/documents';
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc_${uniqueSuffix}${ext}`);
  }
});

const uploadDocument = multer({
  storage: docStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type: ' + file.mimetype), false);
    }
  }
});

// Content routes
router.get('/courses/:courseId/contents', getCourseContents);
router.get('/contents', getContents); // NEW: Get contents by courseId query param
router.post('/courses/:courseId/contents', createContent);
router.post('/courses/:courseId/contents/upload-document', uploadDocument.single('file'), uploadDocumentContent);
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

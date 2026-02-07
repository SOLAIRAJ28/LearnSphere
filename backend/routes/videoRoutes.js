import express from 'express';
import { generateUploadUrl, verifyUpload } from '../controllers/videoUploadController.js';
// import { protect, admin } from '../middleware/authMiddleware.js'; // Uncomment when auth is ready

const router = express.Router();

// Video upload routes
router.post('/upload-url', generateUploadUrl);  // Add protect, admin middleware in production
router.post('/verify-upload', verifyUpload);    // Add protect, admin middleware in production

export default router;

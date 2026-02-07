import multer from 'multer';
import { getGridFSBucket } from '../config/gridfs.js';

// File filter - only accept video files
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WEBM, and MOV video files are allowed.'), false);
  }
};

// Configure multer for video uploads with memory storage
const videoUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for GridFS
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB max file size
  }
});

// Middleware to upload video to GridFS
export const uploadVideoToGridFS = (req, res, next) => {
  const upload = videoUpload.single('video');
  
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5GB.'
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }
    
    next();
  });
};

// Function to save video buffer to GridFS
export const saveVideoToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          contentType: mimetype,
          uploadDate: new Date()
        }
      });
      
      uploadStream.on('error', (error) => {
        reject(error);
      });
      
      uploadStream.on('finish', () => {
        resolve(uploadStream.id);
      });
      
      // Write buffer to GridFS
      uploadStream.end(buffer);
      
    } catch (error) {
      reject(error);
    }
  });
};

export default videoUpload;
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_CONFIG } from '../config/s3.js';
import crypto from 'crypto';

// @desc    Generate signed URL for direct video upload to S3
// @route   POST /api/video/upload-url
// @access  Private (Admin only)
export const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    // Validate required fields
    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: 'fileName, fileType, and fileSize are required'
      });
    }

    // Validate file size (5GB limit)
    if (fileSize > S3_CONFIG.maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum limit of ${S3_CONFIG.maxFileSize / (1024 * 1024 * 1024)}GB`
      });
    }

    // Validate MIME type
    if (!S3_CONFIG.allowedMimeTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only MP4, WEBM, and MOV videos are allowed'
      });
    }

    // Generate unique storage key
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const fileExtension = fileName.split('.').pop();
    const storageKey = `videos/${timestamp}-${randomString}.${fileExtension}`;

    // Create S3 upload command
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: storageKey,
      ContentType: fileType,
      Metadata: {
        originalFileName: fileName,
        uploadedAt: new Date().toISOString()
      }
    });

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: S3_CONFIG.signedUrlExpiry
    });

    // Generate public video URL
    const publicVideoUrl = `${S3_CONFIG.cdnUrl}/${storageKey}`;

    res.json({
      success: true,
      data: {
        uploadUrl,
        storageKey,
        publicVideoUrl,
        expiresIn: S3_CONFIG.signedUrlExpiry
      }
    });

  } catch (error) {
    console.error('Generate upload URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating upload URL',
      error: error.message
    });
  }
};

// @desc    Verify video upload completion (optional check)
// @route   POST /api/video/verify-upload
// @access  Private (Admin only)
export const verifyUpload = async (req, res) => {
  try {
    const { storageKey } = req.body;

    if (!storageKey) {
      return res.status(400).json({
        success: false,
        message: 'storageKey is required'
      });
    }

    // Check if file exists in S3
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: storageKey
    });

    try {
      await s3Client.send(command);
      
      res.json({
        success: true,
        message: 'Video uploaded successfully'
      });
    } catch (err) {
      if (err.name === 'NotFound') {
        return res.status(404).json({
          success: false,
          message: 'Video not found in storage'
        });
      }
      throw err;
    }

  } catch (error) {
    console.error('Verify upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying upload',
      error: error.message
    });
  }
};

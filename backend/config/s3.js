import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  // Optional: Configure for other S3-compatible services (Cloudflare R2, DigitalOcean Spaces, etc.)
  ...(process.env.S3_ENDPOINT && { 
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true // Required for some S3-compatible services
  })
});

// S3 bucket configuration
export const S3_CONFIG = {
  bucket: process.env.S3_BUCKET_NAME || 'learnsphere-videos',
  region: process.env.AWS_REGION || 'us-east-1',
  // Video URL pattern - can be CloudFront CDN or direct S3
  cdnUrl: process.env.CDN_URL || `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
  // Upload configuration
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB in bytes
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  signedUrlExpiry: 3600 // 1 hour for upload URL
};

export default s3Client;

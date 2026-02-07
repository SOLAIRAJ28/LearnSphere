import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import { connectGridFS } from './config/gridfs.js';
import courseRoutes from './routes/courseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB and initialize GridFS
connectDB().then(() => {
  // Initialize GridFS after MongoDB connection
  connectGridFS();
}).catch(error => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', contentRoutes);
app.use('/api', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/video', videoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Learning Backend API is running' });
});

// 404 handler - return JSON for API routes, HTML for others
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.path}`
    });
  }
  next();
});

// Global error handling middleware - ALWAYS return JSON for API routes
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Set status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Always return JSON response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

import Content from '../models/Content.js';
import Course from '../models/Course.js';
import { saveVideoToGridFS } from '../middleware/videoUpload.js';
import { getGridFSBucket } from '../config/gridfs.js';
import mongoose from 'mongoose';

// @desc    Get all contents for a course
// @route   GET /api/courses/:courseId/contents
// @access  Public
export const getCourseContents = async (req, res) => {
  try {
    const contents = await Content.find({ courseId: req.params.courseId })
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      count: contents.length,
      data: contents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contents',
      error: error.message
    });
  }
};

// @desc    Get contents by courseId (query param)
// @route   GET /api/contents?courseId=xxx
// @access  Public
export const getContents = async (req, res) => {
  try {
    const { courseId } = req.query;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId query parameter is required'
      });
    }

    const contents = await Content.find({ courseId })
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      count: contents.length,
      data: contents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contents',
      error: error.message
    });
  }
};

// @desc    Create content for a course
// @route   POST /api/courses/:courseId/contents
// @access  Public
export const createContent = async (req, res) => {
  try {
    const { title, category, duration, url, description } = req.body;

    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get the next order number
    const maxOrder = await Content.findOne({ courseId: req.params.courseId })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    const content = await Content.create({
      courseId: req.params.courseId,
      title,
      category: category || 'Document',
      duration: duration || 0,
      order: nextOrder,
      url,
      description
    });

    // Update course lessons count and duration
    const totalContents = await Content.countDocuments({ courseId: req.params.courseId });
    const totalDuration = await Content.aggregate([
      { $match: { courseId: course._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    course.lessonsCount = totalContents;
    course.totalDuration = totalDuration.length > 0 ? totalDuration[0].total : 0;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
};

// @desc    Update content
// @route   PUT /api/contents/:id
// @access  Public
export const updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update course totals
    const course = await Course.findById(content.courseId);
    if (course) {
      const totalContents = await Content.countDocuments({ courseId: content.courseId });
      const totalDuration = await Content.aggregate([
        { $match: { courseId: content.courseId } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);

      course.lessonsCount = totalContents;
      course.totalDuration = totalDuration.length > 0 ? totalDuration[0].total : 0;
      await course.save();
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/contents/:id
// @access  Public
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Update course totals
    const course = await Course.findById(content.courseId);
    if (course) {
      const totalContents = await Content.countDocuments({ courseId: content.courseId });
      const totalDuration = await Content.aggregate([
        { $match: { courseId: content.courseId } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);

      course.lessonsCount = totalContents;
      course.totalDuration = totalDuration.length > 0 ? totalDuration[0].total : 0;
      await course.save();
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

// @desc    Reorder contents
// @route   PUT /api/courses/:courseId/contents/reorder
// @access  Public
export const reorderContents = async (req, res) => {
  try {
    const { contentIds } = req.body; // Array of content IDs in new order

    if (!Array.isArray(contentIds)) {
      return res.status(400).json({
        success: false,
        message: 'contentIds must be an array'
      });
    }

    // Update order for each content
    const updatePromises = contentIds.map((id, index) =>
      Content.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Contents reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reordering contents',
      error: error.message
    });
  }
};

// @desc    Upload video content
// @route   POST /api/courses/:courseId/contents/video
// @access  Private (Admin only)
export const uploadVideoContent = async (req, res) => {
  try {
    const { title, duration, responsible, description } = req.body;
    const courseId = req.params.courseId;

    // Validate required fields
    if (!title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Title and video file are required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${req.file.originalname.split('.').pop()}`;

    // Save video to GridFS
    const fileId = await saveVideoToGridFS(req.file.buffer, filename, req.file.mimetype);

    // Get the next order number
    const maxOrder = await Content.findOne({ courseId })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    // Create content document
    const content = await Content.create({
      courseId,
      title,
      category: 'video',
      duration: parseInt(duration) || 0,
      order: nextOrder,
      videoFileId: fileId, // Store GridFS file ID
      description: description || '',
      responsible: responsible || ''
    });

    // Update course statistics
    const totalContents = await Content.countDocuments({ courseId });
    const totalDuration = await Content.aggregate([
      { $match: { courseId: course._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    course.lessonsCount = totalContents;
    course.totalDuration = totalDuration.length > 0 ? totalDuration[0].total : 0;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Video content uploaded successfully',
      data: content
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video content',
      error: error.message
    });
  }
};

// @desc    Save video content metadata after cloud upload
// @route   POST /api/courses/:courseId/contents/video-metadata
// @access  Private (Admin only)
export const saveVideoMetadata = async (req, res) => {
  try {
    const { title, duration, responsible, description, videoUrl, storageKey } = req.body;
    const courseId = req.params.courseId;

    // Validate required fields
    if (!title || !videoUrl || !storageKey) {
      return res.status(400).json({
        success: false,
        message: 'Title, videoUrl, and storageKey are required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get the next order number
    const maxOrder = await Content.findOne({ courseId })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    // Create content document with cloud storage metadata
    const content = await Content.create({
      courseId,
      title,
      category: 'video',
      duration: parseInt(duration) || 0,
      order: nextOrder,
      videoUrl,      // Cloud storage URL
      storageKey,    // Storage bucket key
      description: description || '',
      responsible: responsible || ''
    });

    // Update course statistics
    const totalContents = await Content.countDocuments({ courseId });
    const totalDuration = await Content.aggregate([
      { $match: { courseId: course._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    course.lessonsCount = totalContents;
    course.totalDuration = totalDuration.length > 0 ? totalDuration[0].total : 0;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Video content saved successfully',
      data: content
    });

  } catch (error) {
    console.error('Save video metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving video metadata',
      error: error.message
    });
  }
};

// @desc    Stream video from GridFS
// @route   GET /api/video/:fileId
// @access  Public
export const streamVideo = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    const bucket = getGridFSBucket();
    
    // Check if file exists
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': file.metadata?.contentType || 'video/mp4',
      'Content-Length': file.length,
      'Accept-Ranges': 'bytes'
    });

    // Handle range requests for video seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Content-Length': chunksize
      });
      
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId), {
        start,
        end: end + 1
      });
      
      downloadStream.pipe(res);
    } else {
      // Stream the entire file
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      downloadStream.pipe(res);
    }

    // Handle stream errors
    bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
      .on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming video'
          });
        }
      });

  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video',
      error: error.message
    });
  }
};

import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Text search if search query provided
    if (search) {
      query = {
        title: { $regex: search, $options: 'i' }
      };
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    // Get enrollment counts for all courses
    const enrollmentCounts = await Enrollment.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    enrollmentCounts.forEach(e => { countMap[e._id.toString()] = e.count; });

    const coursesWithEnrollments = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.viewsCount = countMap[course._id.toString()] || 0;
      return courseObj;
    });

    res.json({
      success: true,
      count: coursesWithEnrollments.length,
      data: coursesWithEnrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin)
export const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Add or remove tag
// @route   PUT /api/courses/:id/tags
// @access  Private (Admin)
export const updateCourseTags = async (req, res) => {
  try {
    const { tag, action } = req.body;

    if (!tag || !action) {
      return res.status(400).json({
        success: false,
        message: 'Tag and action are required'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (action === 'add') {
      if (!course.tags.includes(tag)) {
        course.tags.push(tag);
      }
    } else if (action === 'remove') {
      course.tags = course.tags.filter(t => t !== tag);
    }

    await course.save();

    res.json({
      success: true,
      message: 'Tags updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating tags',
      error: error.message
    });
  }
};

// @desc    Publish or unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Admin)
export const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling publish status',
      error: error.message
    });
  }
};

// @desc    Generate share link
// @route   POST /api/courses/:id/share
// @access  Private (Admin)
export const generateShareLink = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const shareLink = course.generateShareLink();
    await course.save();

    res.json({
      success: true,
      message: 'Share link generated successfully',
      data: {
        shareLink
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating share link',
      error: error.message
    });
  }
};

// @desc    Upload course image
// @route   PUT /api/courses/:id/image
// @access  Public (temporarily)
export const uploadCourseImage = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      // If upload failed and file was uploaded, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old image if exists
    if (course.imageUrl && course.imageUrl.startsWith('/uploads/')) {
      const oldImagePath = path.join(process.cwd(), course.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image URL (relative path for serving)
    course.imageUrl = `/uploads/courses/${req.file.filename}`;
    await course.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: course
    });
  } catch (error) {
    // If error occurs, delete uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

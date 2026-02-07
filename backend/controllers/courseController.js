import Course from '../models/Course.js';
import { validationResult } from 'express-validator';

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
    
    res.json({
      success: true,
      count: courses.length,
      data: courses
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

import Content from '../models/Content.js';
import Course from '../models/Course.js';

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

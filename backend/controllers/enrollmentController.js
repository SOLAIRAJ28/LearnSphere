import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get enrollment statistics and list
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Get enrollments with populated course and user data
    const enrollments = await Enrollment.find(filter)
      .populate('courseId', 'title')
      .populate('userId', 'username name email totalPoints')
      .sort({ enrolledAt: -1 });

    // Calculate summary statistics
    const totalParticipants = await Enrollment.countDocuments();
    const yetToStart = await Enrollment.countDocuments({ status: 'Yet to Start' });
    const inProgress = await Enrollment.countDocuments({ status: 'In Progress' });
    const completed = await Enrollment.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      data: enrollments,
      summary: {
        totalParticipants,
        yetToStart,
        inProgress,
        completed
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
};

// Create enrollment
export const createEnrollment = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ courseId, userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      courseId,
      userId,
      enrolledAt: new Date(),
      status: 'Yet to Start',
      completionPercentage: 0,
      timeSpent: 0,
      isPaid: false
    });

    // Ensure user has totalPoints field initialized
    await User.findByIdAndUpdate(
      userId, 
      { $setOnInsert: { totalPoints: 0 } }, 
      { upsert: false }
    );

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('courseId', 'title')
      .populate('userId', 'name email totalPoints');

    res.status(201).json({
      success: true,
      data: populatedEnrollment
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: error.message
    });
  }
};

// Update enrollment progress
export const updateEnrollmentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { startedAt, completedAt, timeSpent, completionPercentage, status } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update fields
    if (startedAt !== undefined) enrollment.startedAt = startedAt;
    if (completedAt !== undefined) enrollment.completedAt = completedAt;
    if (timeSpent !== undefined) enrollment.timeSpent = timeSpent;
    if (completionPercentage !== undefined) enrollment.completionPercentage = completionPercentage;
    if (status !== undefined) enrollment.status = status;

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('courseId', 'title')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: populatedEnrollment
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: error.message
    });
  }
};

// Delete enrollment
export const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
      error: error.message
    });
  }
};

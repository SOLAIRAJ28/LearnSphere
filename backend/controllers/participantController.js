import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// @desc    Get all available courses for participant
// @route   GET /api/participant/courses
// @access  Public
export const getParticipantCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.query.userId || null; // Will be from auth middleware later

    // Build query - only show published courses
    let query = { isPublished: true };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .select('title description tags imageUrl price accessRules viewsCount lessonsCount totalDuration')
      .sort({ createdAt: -1 })
      .lean();

    // If user is logged in, fetch enrollment status for each course
    let enrollments = [];
    if (userId) {
      enrollments = await Enrollment.find({ userId })
        .select('courseId status completionPercentage isPaid')
        .lean();
    }

    // Create enrollment map for quick lookup
    const enrollmentMap = {};
    enrollments.forEach(enrollment => {
      enrollmentMap[enrollment.courseId.toString()] = enrollment;
    });

    // Enhance courses with enrollment data
    const enhancedCourses = courses.map(course => {
      const enrollment = enrollmentMap[course._id.toString()];
      const isPaidCourse = course.accessRules && course.accessRules.includes('payment');
      
      return {
        ...course,
        enrollmentStatus: enrollment ? enrollment.status : null,
        completionPercentage: enrollment ? enrollment.completionPercentage : 0,
        isEnrolled: !!enrollment,
        isPaid: enrollment ? enrollment.isPaid : false,
        isPaidCourse,
        canAccess: !isPaidCourse || (enrollment && enrollment.isPaid)
      };
    });

    res.status(200).json({
      success: true,
      count: enhancedCourses.length,
      data: enhancedCourses
    });
  } catch (error) {
    console.error('Error fetching participant courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses',
      error: error.message
    });
  }
};

// @desc    Get participant profile with points and badges
// @route   GET /api/participant/profile/:userId
// @access  Public (will be protected later)
export const getParticipantProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name email totalPoints');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate badge based on points
    let badge = 'Newbie';
    const points = user.totalPoints || 0;
    
    if (points >= 120) badge = 'Master';
    else if (points >= 100) badge = 'Expert';
    else if (points >= 80) badge = 'Specialist';
    else if (points >= 60) badge = 'Achiever';
    else if (points >= 40) badge = 'Explorer';
    else if (points >= 20) badge = 'Newbie';

    // Get enrollment statistics
    const totalEnrollments = await Enrollment.countDocuments({ userId });
    const completedCourses = await Enrollment.countDocuments({ 
      userId, 
      status: 'Completed' 
    });
    const inProgressCourses = await Enrollment.countDocuments({ 
      userId, 
      status: 'In Progress' 
    });

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        totalPoints: points,
        badge,
        stats: {
          totalEnrollments,
          completedCourses,
          inProgressCourses
        }
      }
    });
  } catch (error) {
    console.error('Error fetching participant profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
};

// @desc    Enroll in a course
// @route   POST /api/participant/courses/:id/enroll
// @access  Public (will be protected later)
export const enrollInCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published'
      });
    }

    // Check if it's a paid course
    const isPaidCourse = course.accessRules && course.accessRules.includes('payment');
    if (isPaidCourse) {
      return res.status(400).json({
        success: false,
        message: 'This is a paid course. Please complete payment first.',
        requiresPayment: true,
        price: course.price
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ courseId, userId });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      courseId,
      userId,
      status: 'Yet to Start',
      isPaid: false
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling',
      error: error.message
    });
  }
};

// @desc    Process payment for paid course
// @route   POST /api/participant/courses/:id/pay
// @access  Public (will be protected later)
export const processCoursePayment = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { userId, paymentId, amountPaid } = req.body;

    if (!userId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Payment ID are required'
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

    // Verify it's a paid course
    const isPaidCourse = course.accessRules && course.accessRules.includes('payment');
    if (!isPaidCourse) {
      return res.status(400).json({
        success: false,
        message: 'This course is not a paid course'
      });
    }

    // Check if already enrolled and paid
    const existingEnrollment = await Enrollment.findOne({ courseId, userId });
    if (existingEnrollment && existingEnrollment.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Already purchased this course'
      });
    }

    // Create or update enrollment with payment info
    let enrollment;
    if (existingEnrollment) {
      existingEnrollment.isPaid = true;
      existingEnrollment.paymentId = paymentId;
      existingEnrollment.amountPaid = amountPaid || course.price;
      enrollment = await existingEnrollment.save();
    } else {
      enrollment = await Enrollment.create({
        courseId,
        userId,
        status: 'Yet to Start',
        isPaid: true,
        paymentId,
        amountPaid: amountPaid || course.price
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful. You are now enrolled in the course!',
      data: enrollment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment',
      error: error.message
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/participant/courses/:id/progress
// @access  Public (will be protected later)
export const updateCourseProgress = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { userId, status, completionPercentage } = req.body;

    const enrollment = await Enrollment.findOne({ courseId, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update status
    if (status) {
      enrollment.status = status;
      
      // Update timestamps based on status
      if (status === 'In Progress' && !enrollment.startedAt) {
        enrollment.startedAt = new Date();
      }
      
      if (status === 'Completed' && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        
        // Award points for completion (e.g., 10 points per course)
        await User.findByIdAndUpdate(userId, {
          $inc: { totalPoints: 10 }
        });
      }
    }

    // Update completion percentage
    if (completionPercentage !== undefined) {
      enrollment.completionPercentage = completionPercentage;
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress',
      error: error.message
    });
  }
};

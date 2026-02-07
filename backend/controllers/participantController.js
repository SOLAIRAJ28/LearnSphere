import Course from '../models/Course.js';
import Content from '../models/Content.js';
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
      isPaid: false,
      enrolledAt: new Date(),
      completionPercentage: 0,
      timeSpent: 0
    });

    // Ensure user has totalPoints field initialized
    await User.findByIdAndUpdate(
      userId, 
      { $setOnInsert: { totalPoints: 0 } }, 
      { upsert: false }
    );

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
        amountPaid: amountPaid || course.price,
        enrolledAt: new Date(),
        completionPercentage: 0,
        timeSpent: 0
      });
      
      // Ensure user has totalPoints field initialized
      await User.findByIdAndUpdate(
        userId, 
        { $setOnInsert: { totalPoints: 0 } }, 
        { upsert: false }
      );
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

    // Update enrollment progress
    const oldStatus = enrollment.status;
    enrollment.status = status || enrollment.status;
    enrollment.completionPercentage = completionPercentage || enrollment.completionPercentage;
    
    // Set started date if starting for first time
    if (status === 'In Progress' && !enrollment.startedAt) {
      enrollment.startedAt = new Date();
    }
    
    // Set completed date and award points if completing
    if (status === 'Completed' && oldStatus !== 'Completed') {
      enrollment.completedAt = new Date();
      enrollment.completionPercentage = 100;
      
      // Award points for completion
      const pointsToAward = 20; // 20 points per course completion
      await User.findByIdAndUpdate(
        userId,
        { $inc: { totalPoints: pointsToAward } }
      );
    }
    
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress',
      error: error.message
    });
  }
};

// @desc    Mark a content item as completed and recalculate progress
// @route   PUT /api/participant/courses/:id/complete-content
// @access  Public (will be protected later)
export const markContentComplete = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { userId, contentId } = req.body;

    const enrollment = await Enrollment.findOne({ courseId, userId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if content already completed
    const alreadyCompleted = enrollment.completedContents.some(
      (id) => id.toString() === contentId
    );

    if (!alreadyCompleted) {
      enrollment.completedContents.push(contentId);
    }

    // Get total content count for this course
    const totalContents = await Content.countDocuments({ courseId });

    // Calculate progress: videos/content = 95%, quiz = 5%
    const contentProgress = totalContents > 0
      ? (enrollment.completedContents.length / totalContents) * 95
      : 0;

    const quizProgress = enrollment.quizCompleted ? 5 : 0;
    const totalProgress = Math.min(Math.round(contentProgress + quizProgress), 100);

    enrollment.completionPercentage = totalProgress;

    // Update status based on progress
    if (totalProgress === 0) {
      enrollment.status = 'Yet to Start';
    } else if (totalProgress >= 100) {
      enrollment.status = 'Completed';
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
        // Award points for completion
        await User.findByIdAndUpdate(userId, { $inc: { totalPoints: 20 } });
      }
    } else {
      enrollment.status = 'In Progress';
      if (!enrollment.startedAt) {
        enrollment.startedAt = new Date();
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: alreadyCompleted ? 'Content already completed' : 'Content marked as completed',
      data: {
        completedContents: enrollment.completedContents,
        completionPercentage: enrollment.completionPercentage,
        status: enrollment.status,
        quizCompleted: enrollment.quizCompleted
      }
    });
  } catch (error) {
    console.error('Error marking content complete:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark quiz as completed and add 5% to progress
// @route   PUT /api/participant/courses/:id/complete-quiz
// @access  Public (will be protected later)
export const completeQuiz = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { userId } = req.body;

    const enrollment = await Enrollment.findOne({ courseId, userId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.quizCompleted = true;

    // Recalculate progress
    const totalContents = await Content.countDocuments({ courseId });
    const contentProgress = totalContents > 0
      ? (enrollment.completedContents.length / totalContents) * 95
      : 0;
    const totalProgress = Math.min(Math.round(contentProgress + 5), 100);

    enrollment.completionPercentage = totalProgress;

    if (totalProgress >= 100) {
      enrollment.status = 'Completed';
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
        await User.findByIdAndUpdate(userId, { $inc: { totalPoints: 20 } });
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Quiz completed successfully',
      data: {
        completedContents: enrollment.completedContents,
        completionPercentage: enrollment.completionPercentage,
        status: enrollment.status,
        quizCompleted: enrollment.quizCompleted
      }
    });
  } catch (error) {
    console.error('Error completing quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get enrollment progress details (completed contents, percentage, etc.)
// @route   GET /api/participant/courses/:id/progress/:userId
// @access  Public (will be protected later)
export const getEnrollmentProgress = async (req, res) => {
  try {
    const { id: courseId, userId } = req.params;

    const enrollment = await Enrollment.findOne({ courseId, userId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const totalContents = await Content.countDocuments({ courseId });

    res.status(200).json({
      success: true,
      data: {
        completedContents: enrollment.completedContents,
        completionPercentage: enrollment.completionPercentage,
        status: enrollment.status,
        quizCompleted: enrollment.quizCompleted,
        totalContents
      }
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

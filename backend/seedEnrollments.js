import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Enrollment from './models/Enrollment.js';
import Course from './models/Course.js';
import connectDB from './config/db.js';

dotenv.config();

const seedEnrollments = async () => {
  try {
    await connectDB();

    console.log('Clearing existing users and enrollments...');
    await User.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('Creating sample users...');
    const users = await User.create([
      { username: 'johndoe', name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
      { username: 'janesmith', name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' },
      { username: 'bobwilson', name: 'Bob Wilson', email: 'bob@example.com', password: 'password123', role: 'user' },
      { username: 'alicejohnson', name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'user' },
      { username: 'charliebrown', name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123', role: 'user' },
      { username: 'dianaprince', name: 'Diana Prince', email: 'diana@example.com', password: 'password123', role: 'user' },
      { username: 'eveadams', name: 'Eve Adams', email: 'eve@example.com', password: 'password123', role: 'user' },
      { username: 'frankmiller', name: 'Frank Miller', email: 'frank@example.com', password: 'password123', role: 'user' }
    ]);

    console.log(`Created ${users.length} users`);

    // Get existing courses
    const courses = await Course.find().limit(3);
    
    if (courses.length === 0) {
      console.log('No courses found. Please seed courses first.');
      process.exit(1);
    }

    console.log(`Found ${courses.length} courses`);

    const enrollments = [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Create varied enrollments
    courses.forEach((course, courseIndex) => {
      users.forEach((user, userIndex) => {
        // Create different scenarios
        const scenario = (courseIndex * users.length + userIndex) % 4;

        let enrollment;
        switch (scenario) {
          case 0: // Yet to Start
            enrollment = {
              courseId: course._id,
              userId: user._id,
              enrolledAt: twoWeeksAgo,
              startedAt: null,
              completedAt: null,
              timeSpent: 0,
              completionPercentage: 0,
              status: 'Yet to Start'
            };
            break;

          case 1: // In Progress - Early
            enrollment = {
              courseId: course._id,
              userId: user._id,
              enrolledAt: oneMonthAgo,
              startedAt: twoWeeksAgo,
              completedAt: null,
              timeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 mins
              completionPercentage: Math.floor(Math.random() * 30) + 10, // 10-40%
              status: 'In Progress'
            };
            break;

          case 2: // In Progress - Advanced
            enrollment = {
              courseId: course._id,
              userId: user._id,
              enrolledAt: oneMonthAgo,
              startedAt: oneWeekAgo,
              completedAt: null,
              timeSpent: Math.floor(Math.random() * 200) + 150, // 150-350 mins
              completionPercentage: Math.floor(Math.random() * 40) + 50, // 50-90%
              status: 'In Progress'
            };
            break;

          case 3: // Completed
            enrollment = {
              courseId: course._id,
              userId: user._id,
              enrolledAt: oneMonthAgo,
              startedAt: twoWeeksAgo,
              completedAt: threeDaysAgo,
              timeSpent: Math.floor(Math.random() * 300) + 200, // 200-500 mins
              completionPercentage: 100,
              status: 'Completed'
            };
            break;
        }

        enrollments.push(enrollment);
      });
    });

    console.log('Creating enrollments...');
    await Enrollment.insertMany(enrollments);

    console.log(`✓ Successfully created ${enrollments.length} enrollments`);
    
    // Print summary
    const summary = {
      totalParticipants: await Enrollment.countDocuments(),
      yetToStart: await Enrollment.countDocuments({ status: 'Yet to Start' }),
      inProgress: await Enrollment.countDocuments({ status: 'In Progress' }),
      completed: await Enrollment.countDocuments({ status: 'Completed' })
    };

    console.log('\n📊 Summary:');
    console.log(`   Total Participants: ${summary.totalParticipants}`);
    console.log(`   Yet to Start: ${summary.yetToStart}`);
    console.log(`   In Progress: ${summary.inProgress}`);
    console.log(`   Completed: ${summary.completed}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding enrollments:', error);
    process.exit(1);
  }
};

seedEnrollments();

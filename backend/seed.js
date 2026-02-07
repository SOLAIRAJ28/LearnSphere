import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Course.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@elearning.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');
    console.log('Login credentials:');
    console.log('Email: admin@elearning.com');
    console.log('Password: admin123');

    // Create sample courses
    const courses = [
      {
        title: 'Introduction to Odoo AI',
        tags: ['tag1', 'tag2', 'tag3'],
        viewsCount: 5,
        lessonsCount: 15,
        totalDuration: 1530, // 25:30 in minutes
        isPublished: true
      },
      {
        title: 'Basics of Odoo CRM',
        tags: ['tag1', 'tag2', 'tag3'],
        viewsCount: 20,
        lessonsCount: 20,
        totalDuration: 1235, // 20:35 in minutes
        isPublished: true
      },
      {
        title: 'About Odoo Courses',
        tags: ['tag1', 'tag2', 'tag3'],
        viewsCount: 10,
        lessonsCount: 10,
        totalDuration: 620, // 10:20 in minutes
        isPublished: true
      }
    ];

    await Course.insertMany(courses);
    console.log('Sample courses created');

    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning');
    console.log('MongoDB Connected');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@elearnhub.com' });
    
    if (existingAdmin) {
      console.log('Super Admin already exists!');
      console.log('Email: admin@elearnhub.com');
      process.exit(0);
    }

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@elearnhub.com',
      password: 'Admin@123',
      role: 'admin'
    });

    console.log('✅ Super Admin created successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@elearnhub.com');
    console.log('Password: Admin@123');
    console.log('Role: admin');
    console.log('-----------------------------------');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();

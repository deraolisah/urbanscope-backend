import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      username: 'superadmin',
      email: 'admin@niarobiapartments.com',
      password: 'admin123', // Change this in production
      role: 'admin'
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const admin = await User.create(adminData);
    console.log('✅ Super Admin created successfully:');
    console.log('Email:', admin.email);
    // console.log('Password: Admin123!'); // Remove this in production
    // console.log('⚠️  Change the default password immediately!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

// // Run if called directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   seedAdmin();
// }

// export default seedAdmin;

seedAdmin();
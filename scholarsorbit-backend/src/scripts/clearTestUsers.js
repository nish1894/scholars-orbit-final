import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

const clearTestUsers = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing test users...');

    // Delete all users with @test.com emails
    const result = await User.deleteMany({
      email: { $regex: '@test.com$' },
    });

    console.log(`✅ Deleted ${result.deletedCount} test users`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearTestUsers();

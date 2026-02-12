import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

const testUsers = [
  // Test User 1: Regular Student
  {
    name: 'Rahul Sharma',
    email: 'rahul@test.com',
    password: 'password123',
    userType: 'student',
  },
  // Test User 2: Regular Teacher
  {
    name: 'Dr. Priya Patel',
    email: 'priya@test.com',
    password: 'password123',
    userType: 'teacher',
  },
  // Test User 3: Simple Test (Easy to Remember)
  {
    name: 'Test Student',
    email: 'test@test.com',
    password: 'test123',
    userType: 'student',
  },
  // Test User 4: Another Simple Test
  {
    name: 'Test Teacher',
    email: 'teacher@test.com',
    password: 'test123',
    userType: 'teacher',
  },
  // Test User 5: JEE Aspirant
  {
    name: 'Arjun Reddy',
    email: 'arjun@test.com',
    password: 'jee2025',
    userType: 'student',
  },
  // Test User 6: NEET Aspirant
  {
    name: 'Ananya Iyer',
    email: 'ananya@test.com',
    password: 'neet2025',
    userType: 'student',
  },
  // Test User 7: Physics Teacher
  {
    name: 'Prof. Amit Kumar',
    email: 'amit@test.com',
    password: 'physics123',
    userType: 'teacher',
  },
  // Test User 8: Chemistry Teacher
  {
    name: 'Dr. Sneha Desai',
    email: 'sneha@test.com',
    password: 'chemistry123',
    userType: 'teacher',
  },
  // Test User 9: Biology Teacher
  {
    name: 'Dr. Rajesh Verma',
    email: 'rajesh@test.com',
    password: 'biology123',
    userType: 'teacher',
  },
  // Test User 10: Math Teacher
  {
    name: 'Prof. Meera Singh',
    email: 'meera@test.com',
    password: 'math123',
    userType: 'teacher',
  },
  // Test User 11: Admin Student (for future features)
  {
    name: 'Admin Student',
    email: 'admin@test.com',
    password: 'admin123',
    userType: 'student',
  },
  // Test User 12: Long Name (Edge Case)
  {
    name: 'Sarveshwar Krishnamurthy Ramanujan',
    email: 'longname@test.com',
    password: 'password123',
    userType: 'student',
  },
  // Test User 13: Special Characters in Name
  {
    name: "O'Brien-Smith",
    email: 'obrien@test.com',
    password: 'password123',
    userType: 'student',
  },
  // Test User 14: Single Letter Name (Edge Case)
  {
    name: 'A',
    email: 'a@test.com',
    password: 'password123',
    userType: 'student',
  },
  // Test User 15: Exact Minimum Password (Edge Case)
  {
    name: 'Min Pass',
    email: 'minpass@test.com',
    password: '123456',
    userType: 'student',
  },
];

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting user seeding...\n');

    let created = 0;
    let skipped = 0;
    let failed = 0;

    // Check for --clean flag to clear existing test users first
    if (process.argv.includes('--clean')) {
      console.log('🗑️  Clearing existing test users...');
      const result = await User.deleteMany({
        email: { $regex: '@test.com$' },
      });
      console.log(`   Deleted ${result.deletedCount} test users\n`);
    }

    // Create each user
    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      console.log(`Creating user ${i + 1} of ${testUsers.length}...`);

      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⚠️  Skipped: ${userData.email} (already exists)`);
          skipped++;
          continue;
        }

        // Create new user (password will be hashed by model's pre-save hook)
        const user = new User(userData);
        await user.save();

        console.log(`✅ Created: ${userData.email} (${userData.userType})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed: ${userData.email} - ${error.message}`);
        failed++;
      }
    }

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${testUsers.length}\n`);

    // Close connection and exit
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();

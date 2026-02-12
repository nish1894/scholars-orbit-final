# Create Test Users - Seed Database Prompt

## CONTEXT
I need to test the authentication system in ScholarsOrbit (JEE/NEET study platform).
Currently, the registration and login functionality exists but I need pre-populated test users to verify everything works smoothly.

---

## TASK
Create a database seeding script that populates the MongoDB database with realistic test users for testing authentication, different user types, and various scenarios.

---

## REQUIREMENTS

### 1. Create Seed Script

**File:** `scholarsorbit-backend/src/scripts/seedUsers.js`

**Requirements:**
- Connect to MongoDB using existing config
- Create 10-15 test users with realistic data
- Hash passwords properly using bcrypt (same as User model)
- Include both students and teachers
- Include users with different characteristics for testing edge cases
- Clear existing test users before seeding (optional flag)
- Log success/failure for each user
- Gracefully handle duplicates
- Exit process when complete

---

### 2. Test Users to Create

Create these specific test users:

#### **Test User 1: Regular Student**
```javascript
{
  name: "Rahul Sharma",
  email: "rahul@test.com",
  password: "password123",  // Will be hashed
  userType: "student"
}
```

#### **Test User 2: Regular Teacher**
```javascript
{
  name: "Dr. Priya Patel",
  email: "priya@test.com",
  password: "password123",
  userType: "teacher"
}
```

#### **Test User 3: Simple Test (Easy to Remember)**
```javascript
{
  name: "Test Student",
  email: "test@test.com",
  password: "test123",
  userType: "student"
}
```

#### **Test User 4: Another Simple Test**
```javascript
{
  name: "Test Teacher",
  email: "teacher@test.com",
  password: "test123",
  userType: "teacher"
}
```

#### **Test User 5: JEE Aspirant**
```javascript
{
  name: "Arjun Reddy",
  email: "arjun@test.com",
  password: "jee2025",
  userType: "student"
}
```

#### **Test User 6: NEET Aspirant**
```javascript
{
  name: "Ananya Iyer",
  email: "ananya@test.com",
  password: "neet2025",
  userType: "student"
}
```

#### **Test User 7: Physics Teacher**
```javascript
{
  name: "Prof. Amit Kumar",
  email: "amit@test.com",
  password: "physics123",
  userType: "teacher"
}
```

#### **Test User 8: Chemistry Teacher**
```javascript
{
  name: "Dr. Sneha Desai",
  email: "sneha@test.com",
  password: "chemistry123",
  userType: "teacher"
}
```

#### **Test User 9: Biology Teacher**
```javascript
{
  name: "Dr. Rajesh Verma",
  email: "rajesh@test.com",
  password: "biology123",
  userType: "teacher"
}
```

#### **Test User 10: Math Teacher**
```javascript
{
  name: "Prof. Meera Singh",
  email: "meera@test.com",
  password: "math123",
  userType: "teacher"
}
```

#### **Test User 11: Admin Student (for future features)**
```javascript
{
  name: "Admin Student",
  email: "admin@test.com",
  password: "admin123",
  userType: "student"
}
```

#### **Test User 12: Long Name (Edge Case)**
```javascript
{
  name: "Sarveshwar Krishnamurthy Ramanujan",
  email: "longname@test.com",
  password: "password123",
  userType: "student"
}
```

#### **Test User 13: Special Characters in Name**
```javascript
{
  name: "O'Brien-Smith",
  email: "obrien@test.com",
  password: "password123",
  userType: "student"
}
```

#### **Test User 14: Single Letter Name (Edge Case)**
```javascript
{
  name: "A",
  email: "a@test.com",
  password: "password123",
  userType: "student"
}
```

#### **Test User 15: Exact Minimum Password (Edge Case)**
```javascript
{
  name: "Min Pass",
  email: "minpass@test.com",
  password: "123456",  // Exactly 6 characters (minimum)
  userType: "student"
}
```

---

### 3. Script Features

The script should:

#### **Connection**
- Use existing database connection config
- Load environment variables from .env
- Handle connection errors gracefully

#### **User Creation**
- Use the actual User model (to ensure password hashing works)
- Check if user already exists before creating
- Skip duplicates without crashing
- Log each user creation (success/failure)

#### **Error Handling**
- Catch and log validation errors
- Catch and log duplicate key errors
- Don't crash on individual failures
- Continue creating remaining users

#### **Logging**
- Show progress: "Creating user 1 of 15..."
- Show success: "✅ Created: test@test.com"
- Show skip: "⚠️  Skipped: test@test.com (already exists)"
- Show error: "❌ Failed: invalid@test.com (reason)"
- Show summary: "Created: 10, Skipped: 3, Failed: 2"

#### **Cleanup Option**
- Optional flag to delete existing test users first
- Safety check before deletion
- Only delete users with @test.com emails

#### **Exit Gracefully**
- Close database connection
- Exit process with appropriate code
- Provide summary before exit

---

### 4. Implementation Structure

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const testUsers = [
  {
    name: "Rahul Sharma",
    email: "rahul@test.com",
    password: "password123",
    userType: "student"
  },
  // ... rest of users
];

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🌱 Starting user seeding...\n');
    
    let created = 0;
    let skipped = 0;
    let failed = 0;
    
    // Create each user
    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      
      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  Skipped: ${userData.email} (already exists)`);
          skipped++;
          continue;
        }
        
        // Create new user (password will be hashed by model)
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
```

---

### 5. Add NPM Script

**File:** `scholarsorbit-backend/package.json`

Add this to the "scripts" section:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/scripts/seedUsers.js",
  "seed:clean": "node src/scripts/seedUsers.js --clean"
}
```

---

### 6. Optional: Clear Test Users Script

**File:** `scholarsorbit-backend/src/scripts/clearTestUsers.js`

```javascript
// Script to delete all test users (emails ending with @test.com)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const clearTestUsers = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing test users...');
    
    // Delete all users with @test.com emails
    const result = await User.deleteMany({ 
      email: { $regex: '@test.com$' } 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} test users`);
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearTestUsers();
```

Add script to package.json:
```json
"clear:test": "node src/scripts/clearTestUsers.js"
```

---

### 7. Usage Instructions

#### **Create Test Users:**
```bash
cd scholarsorbit-backend
npm run seed
```

#### **Clear Test Users (if needed):**
```bash
npm run clear:test
```

#### **Recreate Test Users:**
```bash
npm run clear:test && npm run seed
```

---

### 8. Create Test Credentials Document

**File:** `scholarsorbit-backend/TEST_CREDENTIALS.md`

```markdown
# Test User Credentials

## Quick Login Credentials

### Students

| Name | Email | Password | Type |
|------|-------|----------|------|
| Test Student | test@test.com | test123 | student |
| Rahul Sharma | rahul@test.com | password123 | student |
| Arjun Reddy | arjun@test.com | jee2025 | student |
| Ananya Iyer | ananya@test.com | neet2025 | student |
| Admin Student | admin@test.com | admin123 | student |

### Teachers

| Name | Email | Password | Type |
|------|-------|----------|------|
| Test Teacher | teacher@test.com | test123 | teacher |
| Dr. Priya Patel | priya@test.com | password123 | teacher |
| Prof. Amit Kumar | amit@test.com | physics123 | teacher |
| Dr. Sneha Desai | sneha@test.com | chemistry123 | teacher |
| Dr. Rajesh Verma | rajesh@test.com | biology123 | teacher |
| Prof. Meera Singh | meera@test.com | math123 | teacher |

### Edge Cases (for testing)

| Name | Email | Password | Purpose |
|------|-------|----------|---------|
| Sarveshwar Krishnamurthy... | longname@test.com | password123 | Long name test |
| O'Brien-Smith | obrien@test.com | password123 | Special chars |
| A | a@test.com | password123 | Short name |
| Min Pass | minpass@test.com | 123456 | Min password |

## Quick Test Commands

### Test Login (Student)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Test Login (Teacher)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"test123"}'
```

### Test Registration (should fail - duplicate)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","userType":"student"}'
```

## Notes

- All passwords are intentionally simple for testing
- All test emails end with @test.com
- Never use these credentials in production
- Clear test users before deploying to production
```

---

### 9. Verification Steps

After running the seed script:

#### **Check Database (MongoDB Compass or Atlas)**
- Count users in database
- Verify passwords are hashed (not plain text!)
- Check userType field is correct

#### **Test Login via Frontend**
1. Go to http://localhost:5173/login
2. Try: test@test.com / test123
3. Should login successfully
4. Should redirect to dashboard

#### **Test Different User Types**
- Login as student → Check dashboard shows student view
- Login as teacher → Check dashboard shows teacher view

#### **Test Edge Cases**
- Try login with wrong password → Should fail
- Try login with non-existent email → Should fail
- Try registering with existing email → Should fail

---

### 10. Success Criteria

The seeding is successful when:
- ✅ All 15 users are created in database
- ✅ Passwords are hashed (bcrypt)
- ✅ Can login with any test user credentials
- ✅ Different user types (student/teacher) work
- ✅ Script can be run multiple times without errors
- ✅ Existing users are skipped, not duplicated
- ✅ Clear summary is shown after seeding

---

### 11. Security Note

**IMPORTANT:** 
- These are TEST users only
- Never use in production
- Delete before deploying
- Use strong, unique passwords in production
- Don't commit TEST_CREDENTIALS.md to public repos

---

### 12. Additional Features (Optional)

Consider adding:

#### **Random Data Generation**
```javascript
import { faker } from '@faker-js/faker';

// Generate 50 random students
for (let i = 0; i < 50; i++) {
  testUsers.push({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'password123',
    userType: 'student'
  });
}
```

#### **Bulk Insert (Faster)**
```javascript
// Instead of creating one by one, bulk insert
await User.insertMany(testUsers, { ordered: false });
```

#### **Progress Bar**
```javascript
import cliProgress from 'cli-progress';

const bar = new cliProgress.SingleBar();
bar.start(testUsers.length, 0);

// Update bar on each user
bar.increment();

bar.stop();
```

---

## DELIVERABLES

1. ✅ seedUsers.js script
2. ✅ clearTestUsers.js script (optional)
3. ✅ TEST_CREDENTIALS.md document
4. ✅ NPM scripts in package.json
5. ✅ All 15 test users working
6. ✅ Verification that login works with test credentials

---

## QUICK START

After creating the scripts:

```bash
# 1. Navigate to backend
cd scholarsorbit-backend

# 2. Run seed script
npm run seed

# 3. Should see:
# 🌱 Starting user seeding...
# ✅ Created: test@test.com (student)
# ✅ Created: teacher@test.com (teacher)
# ... (13 more users)
# 📊 Seeding Summary:
#    Created: 15
#    Skipped: 0
#    Failed: 0

# 4. Test login in frontend
# Visit: http://localhost:5173/login
# Use: test@test.com / test123
```

---

**Create these scripts so I can easily test the authentication flow with realistic data!**
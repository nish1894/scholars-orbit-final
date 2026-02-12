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
| Sarveshwar Krishnamurthy Ramanujan | longname@test.com | password123 | Long name test |
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

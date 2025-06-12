# ConnectCare AI - Comprehensive Testing Plan

## Overview

This document outlines a complete testing strategy for the ConnectCare AI remote patient monitoring application, covering database functions, authentication flows, data isolation, and end-to-end user scenarios.

## Environment Setup

### Prerequisites

1. **Supabase Project Setup**
   - Active Supabase project with all migrations applied
   - Service role key available for admin operations
   - RLS policies enabled and configured

2. **Test Database Seeding**
   ```sql
   -- Run this script to seed test data
   -- See: testing/seed-test-data.sql
   ```

3. **Environment Variables**
   ```bash
   # Required for testing
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Testing Tools**
   - Jest for unit tests
   - Expo testing library for component tests
   - Supabase client for database tests

### Test Data Structure

The test database will contain:
- **3 Test Doctors**: Dr. Test Alpha, Dr. Test Beta, Dr. Test Gamma
- **5 Test Patients**: Patient A, B, C, D, E
- **Patient Assignments**: 
  - Dr. Alpha: Patients A, B
  - Dr. Beta: Patients C, D
  - Dr. Gamma: Patient E
- **Sample Check-ins**: Recent data for all patients
- **Doctor Notes**: Various notes for assigned patients

## Unit Tests

### 1. Database Function Tests

#### Test: `handle_new_user_signup` Function

**File**: `testing/unit/database-functions.test.js`

```javascript
describe('handle_new_user_signup Function', () => {
  test('should create profile and patient record for patient role', async () => {
    // Test patient signup
    const mockUserData = {
      id: 'test-patient-uuid',
      email: 'test.patient@example.com',
      raw_user_meta_data: {
        full_name: 'Test Patient',
        role: 'patient',
        phone: '+1234567890'
      }
    };
    
    // Verify profile creation
    // Verify patient record creation
    // Verify data integrity
  });

  test('should create profile and doctor record for doctor role', async () => {
    // Test doctor signup
    const mockUserData = {
      id: 'test-doctor-uuid',
      email: 'test.doctor@example.com',
      raw_user_meta_data: {
        full_name: 'Test Doctor',
        role: 'doctor',
        specialization: 'Cardiology',
        license_number: 'TEST-LIC-001'
      }
    };
    
    // Verify profile creation
    // Verify doctor record creation
    // Verify specialization data
  });

  test('should handle missing metadata gracefully', async () => {
    // Test with minimal data
    // Verify fallback values
    // Ensure no errors thrown
  });
});
```

#### Test: RLS Policy Enforcement

**File**: `testing/unit/rls-policies.test.js`

```javascript
describe('Row Level Security Policies', () => {
  test('patients can only access their own data', async () => {
    // Test patient data isolation
  });

  test('doctors can access assigned patients only', async () => {
    // Test doctor-patient assignment enforcement
  });

  test('admins can access all data', async () => {
    // Test admin privileges
  });
});
```

### 2. Authentication Flow Tests

**File**: `testing/unit/auth-flow.test.js`

```javascript
describe('Authentication Flows', () => {
  test('patient signup creates correct database records', async () => {
    // Test complete patient signup flow
  });

  test('doctor signup creates correct database records', async () => {
    // Test complete doctor signup flow
  });

  test('role-based dashboard rendering', async () => {
    // Test dashboard content based on user role
  });
});
```

## End-to-End (E2E) Test Scenarios

### Scenario 1: Patient Signup & Data Isolation

**Test File**: `testing/e2e/patient-isolation.test.js`

**Steps**:
1. **User Registration**
   ```javascript
   // Navigate to signup page
   await page.goto('/auth/role-selection');
   
   // Select patient role
   await page.click('[data-testid="patient-role-button"]');
   
   // Fill signup form
   await page.fill('[data-testid="full-name-input"]', 'Test Patient Alpha');
   await page.fill('[data-testid="email-input"]', 'patient.alpha@test.com');
   await page.fill('[data-testid="password-input"]', 'testpass123');
   await page.fill('[data-testid="confirm-password-input"]', 'testpass123');
   
   // Submit form
   await page.click('[data-testid="create-account-button"]');
   ```

2. **Login Process**
   ```javascript
   // Navigate to login
   await page.goto('/auth/sign-in');
   
   // Enter credentials
   await page.fill('[data-testid="email-input"]', 'patient.alpha@test.com');
   await page.fill('[data-testid="password-input"]', 'testpass123');
   
   // Submit login
   await page.click('[data-testid="sign-in-button"]');
   
   // Verify redirect to patient dashboard
   await expect(page).toHaveURL('/(tabs)');
   ```

3. **Submit Daily Check-in**
   ```javascript
   // Navigate to check-in tab
   await page.click('[data-testid="chat-tab"]');
   
   // Start check-in process
   await page.click('[data-testid="start-checkin-button"]');
   
   // Answer questions (using text mode for testing)
   await page.click('[data-testid="use-text-button"]');
   await page.fill('[data-testid="text-input"]', 'I am feeling well today');
   await page.click('[data-testid="submit-button"]');
   
   // Continue through all questions
   // Verify completion
   ```

4. **View Profile Data**
   ```javascript
   // Navigate to profile tab
   await page.click('[data-testid="profile-tab"]');
   
   // Verify personal information displayed
   await expect(page.locator('[data-testid="profile-name"]')).toContainText('Test Patient Alpha');
   ```

**Expected Results**:
- User should only see their own check-in data
- Profile should display only their personal information
- No access to other patients' data
- Dashboard should show patient-specific interface

**Data Isolation Verification**:
```javascript
// Verify database isolation
const { data: userCheckins } = await supabase
  .from('daily_checkins')
  .select('*')
  .eq('patient_id', testPatientId);

// Should only return check-ins for this specific patient
expect(userCheckins).toHaveLength(1);
expect(userCheckins[0].patient_id).toBe(testPatientId);
```

### Scenario 2: Doctor Signup & Data Access

**Test File**: `testing/e2e/doctor-access.test.js`

**Steps**:
1. **Doctor Registration**
   ```javascript
   // Similar signup flow but with doctor role
   await page.click('[data-testid="doctor-role-button"]');
   
   // Fill doctor-specific information
   await page.fill('[data-testid="specialization-input"]', 'Cardiology');
   await page.fill('[data-testid="license-number-input"]', 'TEST-DOC-001');
   ```

2. **Login and Dashboard Access**
   ```javascript
   // Login as doctor
   // Verify redirect to doctor dashboard
   await expect(page).toHaveURL('/dashboard');
   ```

3. **View Patient List**
   ```javascript
   // Navigate to patients tab
   await page.click('[data-testid="patients-tab"]');
   
   // Verify only assigned patients are visible
   const patientCards = await page.locator('[data-testid="patient-card"]').count();
   expect(patientCards).toBe(2); // Only assigned patients
   ```

4. **Access Patient Check-ins**
   ```javascript
   // Click on assigned patient
   await page.click('[data-testid="patient-card"]:first-child');
   
   // Verify access to patient's check-in data
   await expect(page.locator('[data-testid="checkin-data"]')).toBeVisible();
   ```

**Expected Results**:
- Doctor should only see patients explicitly assigned to them
- Access to check-ins for assigned patients only
- No access to unassigned patients' data
- Doctor-specific dashboard interface

**Access Control Verification**:
```javascript
// Verify doctor can only access assigned patients
const { data: assignedPatients } = await supabase
  .from('patients')
  .select('*')
  .eq('assigned_doctor_id', testDoctorId);

// Should only return patients assigned to this doctor
expect(assignedPatients).toHaveLength(2);
```

### Scenario 3: Invalid Access Attempt

**Test File**: `testing/e2e/security-violations.test.js`

**Steps**:
1. **Login as Patient A**
   ```javascript
   // Login as Patient A
   await loginAsPatient('patient.a@test.com', 'testpass123');
   ```

2. **Attempt Direct API Access to Patient B's Data**
   ```javascript
   // Try to fetch another patient's data via API
   const response = await page.evaluate(async () => {
     const { data, error } = await supabase
       .from('daily_checkins')
       .select('*')
       .eq('patient_id', 'patient-b-uuid'); // Different patient's ID
     
     return { data, error };
   });
   
   // Should return empty result or RLS violation error
   expect(response.data).toEqual([]);
   ```

3. **Attempt URL Manipulation**
   ```javascript
   // Try to navigate to another patient's profile via URL manipulation
   await page.goto('/patient/patient-b-uuid/profile');
   
   // Should redirect to unauthorized page or show empty data
   await expect(page.locator('[data-testid="unauthorized-message"]')).toBeVisible();
   ```

4. **Attempt Cross-Patient Data Access**
   ```javascript
   // Try to access another patient's check-in via direct database query
   const unauthorizedAccess = await page.evaluate(async () => {
     try {
       const { data, error } = await supabase
         .from('patients')
         .select('*')
         .neq('profile_id', 'current-user-id'); // Try to access other patients
       
       return { success: true, data, error };
     } catch (error) {
       return { success: false, error: error.message };
     }
   });
   
   // Should fail or return empty results
   expect(unauthorizedAccess.data).toEqual([]);
   ```

**Expected Results**:
- All unauthorized access attempts must fail
- API calls should return empty results or RLS policy violation errors
- URL manipulation should not expose other users' data
- Database queries should be filtered by RLS policies

**Security Verification**:
```javascript
// Verify RLS policy enforcement
describe('RLS Policy Violations', () => {
  test('patient cannot access other patients data', async () => {
    // Set up patient context
    const patientAId = 'patient-a-uuid';
    const patientBId = 'patient-b-uuid';
    
    // Attempt unauthorized access
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('patient_id', patientBId);
    
    // Should return empty or error
    expect(data).toEqual([]);
  });
});
```

## Real-time Features Testing

### Test: Real-time Check-in Notifications

**File**: `testing/e2e/realtime-features.test.js`

```javascript
describe('Real-time Features', () => {
  test('doctor receives notification when assigned patient submits check-in', async () => {
    // Setup: Login as doctor in one browser context
    const doctorPage = await browser.newPage();
    await loginAsDoctor(doctorPage, 'doctor@test.com', 'testpass123');
    
    // Setup: Login as patient in another browser context
    const patientPage = await browser.newPage();
    await loginAsPatient(patientPage, 'patient@test.com', 'testpass123');
    
    // Doctor: Navigate to monitoring dashboard
    await doctorPage.click('[data-testid="monitoring-tab"]');
    
    // Patient: Submit a check-in
    await patientPage.click('[data-testid="chat-tab"]');
    await submitCheckin(patientPage);
    
    // Doctor: Verify notification received
    await expect(doctorPage.locator('[data-testid="new-checkin-notification"]')).toBeVisible();
    
    // Verify dashboard stats updated
    const updatedStats = await doctorPage.locator('[data-testid="daily-checkins-count"]').textContent();
    expect(parseInt(updatedStats)).toBeGreaterThan(0);
  });
});
```

## Performance Testing

### Database Query Performance

**File**: `testing/performance/database-performance.test.js`

```javascript
describe('Database Performance', () => {
  test('patient data queries execute within acceptable time limits', async () => {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles(*),
        recent_checkins:daily_checkins(*)
      `)
      .eq('assigned_doctor_id', testDoctorId);
    
    const executionTime = Date.now() - startTime;
    
    expect(executionTime).toBeLessThan(1000); // Should execute in under 1 second
    expect(error).toBeNull();
  });
});
```

## Test Execution Commands

### Setup Test Environment
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Seed test database
npm run test:seed-db

# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:e2e
npm run test:security
```

### Test Scripts (package.json)
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest testing/unit",
    "test:e2e": "jest testing/e2e",
    "test:security": "jest testing/e2e/security-violations.test.js",
    "test:seed-db": "node testing/scripts/seed-test-data.js",
    "test:cleanup": "node testing/scripts/cleanup-test-data.js"
  }
}
```

## Expected Test Results Summary

### Unit Tests
- ✅ Database functions create correct records
- ✅ RLS policies enforce data isolation
- ✅ Authentication flows work correctly

### E2E Tests
- ✅ Patient signup creates isolated environment
- ✅ Doctor access limited to assigned patients
- ✅ Unauthorized access attempts fail
- ✅ Real-time features work correctly

### Security Tests
- ✅ RLS policies prevent data leakage
- ✅ API endpoints respect user permissions
- ✅ URL manipulation doesn't expose data
- ✅ Cross-user data access is blocked

### Performance Tests
- ✅ Database queries execute within time limits
- ✅ Real-time subscriptions perform efficiently
- ✅ Dashboard loads quickly with proper data

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: ConnectCare AI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:security
      # E2E tests would require Supabase test instance
```

This comprehensive testing plan ensures the ConnectCare AI application maintains data security, proper access controls, and reliable functionality across all user roles and scenarios.
/**
 * ConnectCare AI - Database Functions Unit Tests
 * 
 * Tests for database functions, triggers, and data integrity
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

describe('Database Functions', () => {
  
  describe('handle_new_user_signup Function', () => {
    
    beforeEach(async () => {
      // Clean up any existing test data
      await cleanupTestData();
    });

    afterEach(async () => {
      // Clean up test data after each test
      await cleanupTestData();
    });

    test('should create profile and patient record for patient role', async () => {
      // Simulate new user data that would come from auth.users trigger
      const mockUserData = {
        id: 'test-patient-signup-uuid',
        email: 'test.patient.signup@example.com',
        raw_user_meta_data: {
          full_name: 'Test Patient Signup',
          role: 'patient',
          phone: '+1234567890',
          date_of_birth: '1990-01-01',
          address: 'Test Address'
        }
      };

      // Manually insert into auth.users to trigger the function
      // Note: In a real test, this would be done through Supabase Auth
      const { error: authError } = await supabase.auth.admin.createUser({
        email: mockUserData.email,
        password: 'testpass123',
        user_metadata: mockUserData.raw_user_meta_data
      });

      expect(authError).toBeNull();

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', mockUserData.email)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile.full_name).toBe('Test Patient Signup');
      expect(profile.role).toBe('patient');
      expect(profile.phone).toBe('+1234567890');

      // Verify patient record was created
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      expect(patientError).toBeNull();
      expect(patient).toBeTruthy();
      expect(patient.profile_id).toBe(profile.id);
      expect(patient.status).toBe('active');
      expect(patient.patient_id).toMatch(/^PAT-\d{4}-\d{3}-/);
    });

    test('should create profile and doctor record for doctor role', async () => {
      const mockUserData = {
        id: 'test-doctor-signup-uuid',
        email: 'test.doctor.signup@example.com',
        raw_user_meta_data: {
          full_name: 'Test Doctor Signup',
          role: 'doctor',
          specialization: 'Test Cardiology',
          license_number: 'TEST-LIC-SIGNUP-001',
          years_of_experience: 10,
          hospital_affiliation: 'Test Hospital'
        }
      };

      // Create user through Supabase Auth
      const { error: authError } = await supabase.auth.admin.createUser({
        email: mockUserData.email,
        password: 'testpass123',
        user_metadata: mockUserData.raw_user_meta_data
      });

      expect(authError).toBeNull();

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', mockUserData.email)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile.full_name).toBe('Test Doctor Signup');
      expect(profile.role).toBe('doctor');

      // Verify doctor record was created
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      expect(doctorError).toBeNull();
      expect(doctor).toBeTruthy();
      expect(doctor.profile_id).toBe(profile.id);
      expect(doctor.specialization).toBe('Test Cardiology');
      expect(doctor.license_number).toBe('TEST-LIC-SIGNUP-001');
      expect(doctor.years_of_experience).toBe(10);
      expect(doctor.is_active).toBe(true);
    });

    test('should handle missing metadata gracefully', async () => {
      const mockUserData = {
        email: 'test.minimal@example.com',
        raw_user_meta_data: {
          // Minimal data - only email provided
        }
      };

      // Create user with minimal metadata
      const { error: authError } = await supabase.auth.admin.createUser({
        email: mockUserData.email,
        password: 'testpass123',
        user_metadata: mockUserData.raw_user_meta_data
      });

      expect(authError).toBeNull();

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created with fallback values
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', mockUserData.email)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile.full_name).toBe('test.minimal'); // Should use email prefix as fallback
      expect(profile.role).toBe('patient'); // Should default to patient
    });

    test('should handle invalid role gracefully', async () => {
      const mockUserData = {
        email: 'test.invalid.role@example.com',
        raw_user_meta_data: {
          full_name: 'Test Invalid Role',
          role: 'invalid_role' // Invalid role
        }
      };

      // Create user with invalid role
      const { error: authError } = await supabase.auth.admin.createUser({
        email: mockUserData.email,
        password: 'testpass123',
        user_metadata: mockUserData.raw_user_meta_data
      });

      expect(authError).toBeNull();

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created with default role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', mockUserData.email)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeTruthy();
      expect(profile.role).toBe('patient'); // Should default to patient for invalid role
    });
  });

  describe('Data Integrity Constraints', () => {
    
    test('should enforce unique email constraint', async () => {
      // Create first user
      const { error: firstError } = await supabase.auth.admin.createUser({
        email: 'duplicate.test@example.com',
        password: 'testpass123',
        user_metadata: { full_name: 'First User' }
      });

      expect(firstError).toBeNull();

      // Try to create second user with same email
      const { error: secondError } = await supabase.auth.admin.createUser({
        email: 'duplicate.test@example.com',
        password: 'testpass123',
        user_metadata: { full_name: 'Second User' }
      });

      expect(secondError).toBeTruthy();
      expect(secondError.message).toContain('already registered');
    });

    test('should enforce unique license number for doctors', async () => {
      // Create first doctor
      const { data: firstDoctor } = await supabase
        .from('doctors')
        .insert({
          profile_id: 'test-doctor-1-uuid',
          license_number: 'DUPLICATE-LICENSE-001',
          specialization: 'Cardiology'
        })
        .select()
        .single();

      expect(firstDoctor).toBeTruthy();

      // Try to create second doctor with same license number
      const { error: duplicateError } = await supabase
        .from('doctors')
        .insert({
          profile_id: 'test-doctor-2-uuid',
          license_number: 'DUPLICATE-LICENSE-001',
          specialization: 'Neurology'
        });

      expect(duplicateError).toBeTruthy();
      expect(duplicateError.code).toBe('23505'); // Unique violation
    });

    test('should enforce foreign key constraints', async () => {
      // Try to create patient with non-existent doctor assignment
      const { error: fkError } = await supabase
        .from('patients')
        .insert({
          profile_id: 'test-patient-fk-uuid',
          patient_id: 'TEST-FK-001',
          assigned_doctor_id: 'non-existent-doctor-id'
        });

      expect(fkError).toBeTruthy();
      expect(fkError.code).toBe('23503'); // Foreign key violation
    });
  });

  describe('Timestamp Functions', () => {
    
    test('should automatically set created_at and updated_at timestamps', async () => {
      const beforeTime = new Date();

      // Create a profile
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: 'test-timestamp-uuid',
          email: 'timestamp.test@example.com',
          full_name: 'Timestamp Test',
          role: 'patient'
        })
        .select()
        .single();

      const afterTime = new Date();

      expect(profile).toBeTruthy();
      expect(new Date(profile.created_at)).toBeInstanceOf(Date);
      expect(new Date(profile.updated_at)).toBeInstanceOf(Date);
      
      // Verify timestamps are within expected range
      expect(new Date(profile.created_at).getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(new Date(profile.created_at).getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test('should update updated_at timestamp on record update', async () => {
      // Create a profile
      const { data: originalProfile } = await supabase
        .from('profiles')
        .insert({
          id: 'test-update-timestamp-uuid',
          email: 'update.timestamp.test@example.com',
          full_name: 'Original Name',
          role: 'patient'
        })
        .select()
        .single();

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the profile
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ full_name: 'Updated Name' })
        .eq('id', 'test-update-timestamp-uuid')
        .select()
        .single();

      expect(updatedProfile).toBeTruthy();
      expect(updatedProfile.full_name).toBe('Updated Name');
      expect(new Date(updatedProfile.updated_at).getTime()).toBeGreaterThan(
        new Date(originalProfile.updated_at).getTime()
      );
    });
  });
});

/**
 * Helper function to clean up test data
 */
async function cleanupTestData() {
  // Delete test data in correct order (respecting foreign key constraints)
  await supabase.from('daily_checkins').delete().like('patient_id', 'test-%');
  await supabase.from('doctor_notes').delete().like('patient_id', 'test-%');
  await supabase.from('patients').delete().like('patient_id', 'TEST-%');
  await supabase.from('doctors').delete().like('license_number', 'TEST-%');
  await supabase.from('profiles').delete().like('email', '%@example.com');
  
  // Clean up auth users
  const { data: users } = await supabase.auth.admin.listUsers();
  if (users?.users) {
    for (const user of users.users) {
      if (user.email?.includes('@example.com')) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  }
}
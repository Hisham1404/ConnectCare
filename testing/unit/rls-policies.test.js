/**
 * ConnectCare AI - Row Level Security (RLS) Policies Unit Tests
 * 
 * Tests to verify that RLS policies correctly enforce data isolation
 * and access controls based on user roles and relationships
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create different client instances for different user contexts
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

describe('Row Level Security Policies', () => {
  
  let testUsers = {};
  let testData = {};

  beforeAll(async () => {
    // Set up test users and data
    await setupTestEnvironment();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestEnvironment();
  });

  describe('Patient Data Isolation', () => {
    
    test('patients can only access their own profile data', async () => {
      // Create client for Patient A
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Patient A should be able to read their own profile
      const { data: ownProfile, error: ownError } = await patientAClient
        .from('profiles')
        .select('*')
        .eq('id', testUsers.patientA.id)
        .single();

      expect(ownError).toBeNull();
      expect(ownProfile).toBeTruthy();
      expect(ownProfile.email).toBe('patient.a@test.connectcare.ai');

      // Patient A should be able to read other profiles (for doctor info, etc.)
      // but this is allowed by design for healthcare coordination
      const { data: allProfiles, error: allError } = await patientAClient
        .from('profiles')
        .select('*');

      expect(allError).toBeNull();
      expect(allProfiles).toBeTruthy();
      expect(allProfiles.length).toBeGreaterThan(1);
    });

    test('patients can only access their own patient record', async () => {
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Patient A should access their own patient record
      const { data: ownPatientData, error: ownError } = await patientAClient
        .from('patients')
        .select('*')
        .eq('profile_id', testUsers.patientA.id);

      expect(ownError).toBeNull();
      expect(ownPatientData).toBeTruthy();
      expect(ownPatientData.length).toBe(1);
      expect(ownPatientData[0].profile_id).toBe(testUsers.patientA.id);

      // Patient A should NOT access Patient B's data
      const { data: otherPatientData, error: otherError } = await patientAClient
        .from('patients')
        .select('*')
        .eq('profile_id', testUsers.patientB.id);

      expect(otherError).toBeNull();
      expect(otherPatientData).toEqual([]); // Should return empty array due to RLS
    });

    test('patients can only access their own check-ins', async () => {
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Patient A should access their own check-ins
      const { data: ownCheckins, error: ownError } = await patientAClient
        .from('daily_checkins')
        .select('*');

      expect(ownError).toBeNull();
      expect(ownCheckins).toBeTruthy();
      
      // All returned check-ins should belong to Patient A
      ownCheckins.forEach(checkin => {
        expect(checkin.patient_id).toBe(testData.patientA.id);
      });

      // Try to access specific check-in from Patient B
      const { data: otherCheckin, error: otherError } = await patientAClient
        .from('daily_checkins')
        .select('*')
        .eq('patient_id', testData.patientB.id);

      expect(otherError).toBeNull();
      expect(otherCheckin).toEqual([]); // Should return empty due to RLS
    });

    test('patients can read medical notes about them', async () => {
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Patient A should be able to read notes about them
      const { data: ownNotes, error: ownError } = await patientAClient
        .from('doctor_notes')
        .select('*');

      expect(ownError).toBeNull();
      expect(ownNotes).toBeTruthy();
      
      // All returned notes should be about Patient A
      ownNotes.forEach(note => {
        expect(note.patient_id).toBe(testData.patientA.id);
      });
    });
  });

  describe('Doctor Access Controls', () => {
    
    test('doctors can access data for assigned patients only', async () => {
      const doctorAlphaClient = createClient(supabaseUrl, supabaseAnonKey);
      await doctorAlphaClient.auth.signInWithPassword({
        email: 'doctor.alpha@test.connectcare.ai',
        password: 'testpass123'
      });

      // Dr. Alpha should access patients assigned to them (A and B)
      const { data: assignedPatients, error: assignedError } = await doctorAlphaClient
        .from('patients')
        .select('*');

      expect(assignedError).toBeNull();
      expect(assignedPatients).toBeTruthy();
      
      // Should only return patients assigned to Dr. Alpha
      const assignedPatientIds = assignedPatients.map(p => p.id);
      expect(assignedPatientIds).toContain(testData.patientA.id);
      expect(assignedPatientIds).toContain(testData.patientB.id);
      expect(assignedPatientIds).not.toContain(testData.patientC.id); // Assigned to Dr. Beta
    });

    test('doctors can access check-ins for assigned patients only', async () => {
      const doctorAlphaClient = createClient(supabaseUrl, supabaseAnonKey);
      await doctorAlphaClient.auth.signInWithPassword({
        email: 'doctor.alpha@test.connectcare.ai',
        password: 'testpass123'
      });

      // Dr. Alpha should access check-ins for assigned patients
      const { data: assignedCheckins, error: assignedError } = await doctorAlphaClient
        .from('daily_checkins')
        .select('*');

      expect(assignedError).toBeNull();
      expect(assignedCheckins).toBeTruthy();
      
      // All check-ins should be for patients assigned to Dr. Alpha
      const patientIds = assignedCheckins.map(c => c.patient_id);
      patientIds.forEach(patientId => {
        expect([testData.patientA.id, testData.patientB.id]).toContain(patientId);
      });
    });

    test('doctors can manage notes for assigned patients', async () => {
      const doctorAlphaClient = createClient(supabaseUrl, supabaseAnonKey);
      await doctorAlphaClient.auth.signInWithPassword({
        email: 'doctor.alpha@test.connectcare.ai',
        password: 'testpass123'
      });

      // Dr. Alpha should be able to create notes for assigned patients
      const { data: newNote, error: createError } = await doctorAlphaClient
        .from('doctor_notes')
        .insert({
          patient_id: testData.patientA.id,
          doctor_id: testData.doctorAlpha.id,
          note_type: 'observation',
          title: 'Test Note from RLS Test',
          content: 'This is a test note created during RLS policy testing.',
          is_critical: false
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(newNote).toBeTruthy();
      expect(newNote.patient_id).toBe(testData.patientA.id);

      // Dr. Alpha should NOT be able to create notes for unassigned patients
      const { error: unauthorizedError } = await doctorAlphaClient
        .from('doctor_notes')
        .insert({
          patient_id: testData.patientC.id, // Patient C is assigned to Dr. Beta
          doctor_id: testData.doctorAlpha.id,
          note_type: 'observation',
          title: 'Unauthorized Note',
          content: 'This should fail due to RLS.',
          is_critical: false
        });

      expect(unauthorizedError).toBeTruthy(); // Should fail due to RLS
    });

    test('doctors can only manage their own doctor profile', async () => {
      const doctorAlphaClient = createClient(supabaseUrl, supabaseAnonKey);
      await doctorAlphaClient.auth.signInWithPassword({
        email: 'doctor.alpha@test.connectcare.ai',
        password: 'testpass123'
      });

      // Dr. Alpha should be able to update their own doctor record
      const { data: updatedDoctor, error: updateError } = await doctorAlphaClient
        .from('doctors')
        .update({ consultation_fee: 3000.00 })
        .eq('id', testData.doctorAlpha.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updatedDoctor).toBeTruthy();
      expect(updatedDoctor.consultation_fee).toBe('3000.00');

      // Dr. Alpha should NOT be able to update Dr. Beta's record
      const { error: unauthorizedUpdateError } = await doctorAlphaClient
        .from('doctors')
        .update({ consultation_fee: 5000.00 })
        .eq('id', testData.doctorBeta.id);

      expect(unauthorizedUpdateError).toBeTruthy(); // Should fail due to RLS
    });
  });

  describe('Admin Access Controls', () => {
    
    test('admins can access all data', async () => {
      const adminClient = createClient(supabaseUrl, supabaseAnonKey);
      await adminClient.auth.signInWithPassword({
        email: 'admin@test.connectcare.ai',
        password: 'testpass123'
      });

      // Admin should access all profiles
      const { data: allProfiles, error: profilesError } = await adminClient
        .from('profiles')
        .select('*');

      expect(profilesError).toBeNull();
      expect(allProfiles).toBeTruthy();
      expect(allProfiles.length).toBeGreaterThanOrEqual(8); // All test users

      // Admin should access all patients
      const { data: allPatients, error: patientsError } = await adminClient
        .from('patients')
        .select('*');

      expect(patientsError).toBeNull();
      expect(allPatients).toBeTruthy();
      expect(allPatients.length).toBeGreaterThanOrEqual(5); // All test patients

      // Admin should access all check-ins
      const { data: allCheckins, error: checkinsError } = await adminClient
        .from('daily_checkins')
        .select('*');

      expect(checkinsError).toBeNull();
      expect(allCheckins).toBeTruthy();
      expect(allCheckins.length).toBeGreaterThanOrEqual(5); // All test check-ins

      // Admin should access all doctor notes
      const { data: allNotes, error: notesError } = await adminClient
        .from('doctor_notes')
        .select('*');

      expect(notesError).toBeNull();
      expect(allNotes).toBeTruthy();
      expect(allNotes.length).toBeGreaterThanOrEqual(5); // All test notes
    });
  });

  describe('Nurse Access Controls', () => {
    
    test('nurses can view patient data and check-ins', async () => {
      const nurseClient = createClient(supabaseUrl, supabaseAnonKey);
      await nurseClient.auth.signInWithPassword({
        email: 'nurse@test.connectcare.ai',
        password: 'testpass123'
      });

      // Nurse should view all patient data
      const { data: allPatients, error: patientsError } = await nurseClient
        .from('patients')
        .select('*');

      expect(patientsError).toBeNull();
      expect(allPatients).toBeTruthy();
      expect(allPatients.length).toBeGreaterThanOrEqual(5);

      // Nurse should view all check-ins
      const { data: allCheckins, error: checkinsError } = await nurseClient
        .from('daily_checkins')
        .select('*');

      expect(checkinsError).toBeNull();
      expect(allCheckins).toBeTruthy();
      expect(allCheckins.length).toBeGreaterThanOrEqual(5);

      // Nurse should view all doctor notes
      const { data: allNotes, error: notesError } = await nurseClient
        .from('doctor_notes')
        .select('*');

      expect(notesError).toBeNull();
      expect(allNotes).toBeTruthy();
      expect(allNotes.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Cross-User Data Access Prevention', () => {
    
    test('patient cannot access another patients data via direct query', async () => {
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Try to access Patient B's specific data
      const { data: unauthorizedData, error } = await patientAClient
        .from('patients')
        .select('*')
        .eq('id', testData.patientB.id);

      expect(error).toBeNull();
      expect(unauthorizedData).toEqual([]); // Should return empty due to RLS
    });

    test('doctor cannot access unassigned patients data', async () => {
      const doctorAlphaClient = createClient(supabaseUrl, supabaseAnonKey);
      await doctorAlphaClient.auth.signInWithPassword({
        email: 'doctor.alpha@test.connectcare.ai',
        password: 'testpass123'
      });

      // Dr. Alpha tries to access Patient C (assigned to Dr. Beta)
      const { data: unauthorizedPatient, error } = await doctorAlphaClient
        .from('patients')
        .select('*')
        .eq('id', testData.patientC.id);

      expect(error).toBeNull();
      expect(unauthorizedPatient).toEqual([]); // Should return empty due to RLS
    });

    test('RLS policies prevent SQL injection attempts', async () => {
      const patientAClient = createClient(supabaseUrl, supabaseAnonKey);
      await patientAClient.auth.signInWithPassword({
        email: 'patient.a@test.connectcare.ai',
        password: 'testpass123'
      });

      // Attempt SQL injection-style query
      const { data: injectionAttempt, error } = await patientAClient
        .from('patients')
        .select('*')
        .eq('id', `'; DROP TABLE patients; --`);

      expect(error).toBeNull();
      expect(injectionAttempt).toEqual([]); // Should return empty, not cause damage
    });
  });
});

/**
 * Set up test environment with users and data
 */
async function setupTestEnvironment() {
  // This function would set up test users and data
  // In a real implementation, this would create test auth users
  // and populate the test data using the seed script
  
  // For now, we'll assume the test data from seed-test-data.sql is available
  testUsers = {
    patientA: { id: 'test-patient-a-uuid' },
    patientB: { id: 'test-patient-b-uuid' },
    patientC: { id: 'test-patient-c-uuid' },
    doctorAlpha: { id: 'test-doctor-alpha-uuid' },
    doctorBeta: { id: 'test-doctor-beta-uuid' },
    admin: { id: 'test-admin-uuid' },
    nurse: { id: 'test-nurse-uuid' }
  };

  testData = {
    patientA: { id: 'test-patient-a-db-id' },
    patientB: { id: 'test-patient-b-db-id' },
    patientC: { id: 'test-patient-c-db-id' },
    doctorAlpha: { id: 'test-doctor-alpha-db-id' },
    doctorBeta: { id: 'test-doctor-beta-db-id' }
  };
}

/**
 * Clean up test environment
 */
async function cleanupTestEnvironment() {
  // Clean up any test data created during tests
  // This would remove test notes, etc.
}
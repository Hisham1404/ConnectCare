-- ============================================================================
-- ConnectCare AI - Test Data Seeding Script
-- ============================================================================
-- This script creates comprehensive test data for the ConnectCare AI application
-- Run this script against your test Supabase database before running tests

-- ============================================================================
-- 1. CLEAN UP EXISTING TEST DATA
-- ============================================================================

-- Delete existing test data (in correct order due to foreign key constraints)
DELETE FROM daily_checkins WHERE patient_id IN (
  SELECT id FROM patients WHERE patient_id LIKE 'TEST-%'
);

DELETE FROM doctor_notes WHERE patient_id IN (
  SELECT id FROM patients WHERE patient_id LIKE 'TEST-%'
);

DELETE FROM patients WHERE patient_id LIKE 'TEST-%';
DELETE FROM doctors WHERE license_number LIKE 'TEST-%';
DELETE FROM profiles WHERE email LIKE '%@test.connectcare.ai';

-- ============================================================================
-- 2. CREATE TEST DOCTOR PROFILES
-- ============================================================================

-- Test Doctor Alpha (Cardiologist)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  'test-doctor-alpha-uuid',
  'doctor.alpha@test.connectcare.ai',
  'Dr. Test Alpha',
  'doctor',
  '+91 98765 00001',
  'Test Hospital, Mumbai, Maharashtra',
  NOW(),
  NOW()
);

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  'test-doctor-alpha-db-id',
  'test-doctor-alpha-uuid',
  'TEST-DOC-ALPHA-001',
  'Cardiothoracic Surgery',
  15,
  'Test Apollo Hospital, Mumbai',
  2500.00,
  true,
  NOW(),
  NOW()
);

-- Test Doctor Beta (Orthopedic Surgeon)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  'test-doctor-beta-uuid',
  'doctor.beta@test.connectcare.ai',
  'Dr. Test Beta',
  'doctor',
  '+91 98765 00002',
  'Test Hospital, Delhi, India',
  NOW(),
  NOW()
);

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  'test-doctor-beta-db-id',
  'test-doctor-beta-uuid',
  'TEST-DOC-BETA-002',
  'Orthopedic Surgery',
  12,
  'Test AIIMS, Delhi',
  2000.00,
  true,
  NOW(),
  NOW()
);

-- Test Doctor Gamma (General Surgeon)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  'test-doctor-gamma-uuid',
  'doctor.gamma@test.connectcare.ai',
  'Dr. Test Gamma',
  'doctor',
  '+91 98765 00003',
  'Test Hospital, Bangalore, Karnataka',
  NOW(),
  NOW()
);

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  'test-doctor-gamma-db-id',
  'test-doctor-gamma-uuid',
  'TEST-DOC-GAMMA-003',
  'General Surgery',
  8,
  'Test Manipal Hospital, Bangalore',
  1800.00,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- 3. CREATE TEST PATIENT PROFILES
-- ============================================================================

-- Test Patient A (Assigned to Dr. Alpha)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'test-patient-a-uuid',
  'patient.a@test.connectcare.ai',
  'Test Patient Alpha',
  'patient',
  '+91 98765 10001',
  '1965-03-15',
  'Test Address A, Mumbai, Maharashtra',
  'Emergency Contact A',
  '+91 98765 10011',
  NOW(),
  NOW()
);

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'test-patient-a-db-id',
  'test-patient-a-uuid',
  'TEST-PAT-2024-001',
  'test-doctor-alpha-db-id',
  'TEST-MRN-001-2024',
  'O+',
  ARRAY['Penicillin', 'Shellfish'],
  ARRAY['Hypertension', 'Diabetes Type 2'],
  'active',
  '2024-12-01',
  '2024-12-05',
  'Coronary Artery Bypass',
  'Patient recovering well, following prescribed medication regimen.',
  NOW(),
  NOW()
);

-- Test Patient B (Assigned to Dr. Alpha)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'test-patient-b-uuid',
  'patient.b@test.connectcare.ai',
  'Test Patient Beta',
  'patient',
  '+91 98765 10002',
  '1970-07-22',
  'Test Address B, Mumbai, Maharashtra',
  'Emergency Contact B',
  '+91 98765 10012',
  NOW(),
  NOW()
);

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'test-patient-b-db-id',
  'test-patient-b-uuid',
  'TEST-PAT-2024-002',
  'test-doctor-alpha-db-id',
  'TEST-MRN-002-2024',
  'A+',
  ARRAY['Aspirin'],
  ARRAY['Arthritis'],
  'critical',
  '2024-12-08',
  '2024-12-10',
  'Heart Valve Replacement',
  'Patient experiencing some complications, monitoring closely.',
  NOW(),
  NOW()
);

-- Test Patient C (Assigned to Dr. Beta)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'test-patient-c-uuid',
  'patient.c@test.connectcare.ai',
  'Test Patient Gamma',
  'patient',
  '+91 98765 10003',
  '1975-11-10',
  'Test Address C, Delhi, India',
  'Emergency Contact C',
  '+91 98765 10013',
  NOW(),
  NOW()
);

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'test-patient-c-db-id',
  'test-patient-c-uuid',
  'TEST-PAT-2024-003',
  'test-doctor-beta-db-id',
  'TEST-MRN-003-2024',
  'B+',
  ARRAY[],
  ARRAY['High Cholesterol'],
  'active',
  '2024-12-05',
  '2024-12-07',
  'Hip Replacement',
  'Excellent recovery progress, patient very compliant.',
  NOW(),
  NOW()
);

-- Test Patient D (Assigned to Dr. Beta)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'test-patient-d-uuid',
  'patient.d@test.connectcare.ai',
  'Test Patient Delta',
  'patient',
  '+91 98765 10004',
  '1980-01-25',
  'Test Address D, Delhi, India',
  'Emergency Contact D',
  '+91 98765 10014',
  NOW(),
  NOW()
);

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'test-patient-d-db-id',
  'test-patient-d-uuid',
  'TEST-PAT-2024-004',
  'test-doctor-beta-db-id',
  'TEST-MRN-004-2024',
  'AB+',
  ARRAY['Latex'],
  ARRAY['Osteoarthritis'],
  'active',
  '2024-12-03',
  '2024-12-04',
  'Knee Replacement',
  'Patient progressing well with physical therapy.',
  NOW(),
  NOW()
);

-- Test Patient E (Assigned to Dr. Gamma)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'test-patient-e-uuid',
  'patient.e@test.connectcare.ai',
  'Test Patient Epsilon',
  'patient',
  '+91 98765 10005',
  '1985-09-12',
  'Test Address E, Bangalore, Karnataka',
  'Emergency Contact E',
  '+91 98765 10015',
  NOW(),
  NOW()
);

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'test-patient-e-db-id',
  'test-patient-e-uuid',
  'TEST-PAT-2024-005',
  'test-doctor-gamma-db-id',
  'TEST-MRN-005-2024',
  'O-',
  ARRAY['Nuts', 'Dairy'],
  ARRAY[],
  'active',
  '2024-12-06',
  '2024-12-08',
  'Gallbladder Removal',
  'Minimally invasive surgery completed successfully.',
  NOW(),
  NOW()
);

-- ============================================================================
-- 4. CREATE TEST DAILY CHECK-INS
-- ============================================================================

-- Recent check-ins for Patient A (Dr. Alpha's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'test-checkin-a-1',
    'test-patient-a-db-id',
    CURRENT_DATE,
    'completed',
    98.6,
    120,
    80,
    72,
    98,
    78.5,
    3,
    ARRAY['mild fatigue'],
    4,
    true,
    'moderate',
    true,
    'Feeling better today, took morning walk.',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'test-checkin-a-2',
    'test-patient-a-db-id',
    CURRENT_DATE - INTERVAL '1 day',
    'completed',
    98.4,
    118,
    78,
    70,
    99,
    78.3,
    2,
    ARRAY[],
    5,
    true,
    'light',
    false,
    'Good day overall, rested well.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Recent check-ins for Patient B (Dr. Alpha's patient - critical status)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'test-checkin-b-1',
    'test-patient-b-db-id',
    CURRENT_DATE,
    'completed',
    101.2,
    140,
    90,
    95,
    94,
    79.1,
    8,
    ARRAY['chest pain', 'shortness of breath'],
    2,
    true,
    'minimal',
    false,
    'Experiencing increased pain and difficulty breathing.',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  );

-- Recent check-ins for Patient C (Dr. Beta's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'test-checkin-c-1',
    'test-patient-c-db-id',
    CURRENT_DATE,
    'completed',
    98.8,
    125,
    82,
    75,
    97,
    70.2,
    4,
    ARRAY['joint stiffness'],
    3,
    true,
    'moderate',
    true,
    'Hip feeling better, completed physical therapy exercises.',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  );

-- Recent check-ins for Patient D (Dr. Beta's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'test-checkin-d-1',
    'test-patient-d-db-id',
    CURRENT_DATE,
    'completed',
    98.5,
    115,
    75,
    68,
    99,
    72.8,
    3,
    ARRAY['mild swelling'],
    4,
    true,
    'light',
    true,
    'Knee mobility improving, swelling reduced.',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  );

-- Recent check-ins for Patient E (Dr. Gamma's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'test-checkin-e-1',
    'test-patient-e-db-id',
    CURRENT_DATE,
    'completed',
    98.7,
    110,
    70,
    65,
    100,
    65.5,
    1,
    ARRAY[],
    5,
    true,
    'normal',
    true,
    'Feeling excellent, no pain or discomfort.',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  );

-- ============================================================================
-- 5. CREATE TEST DOCTOR NOTES
-- ============================================================================

-- Dr. Alpha's notes for Patient A
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'test-note-alpha-a-1',
    'test-patient-a-db-id',
    'test-doctor-alpha-db-id',
    'follow_up',
    'Post-Surgery Follow-up - Day 7',
    'Patient is recovering well from coronary artery bypass surgery. Incision sites are healing properly with no signs of infection. Patient reports manageable pain levels and is following medication regimen. Recommend continued monitoring and gradual increase in activity level.',
    false,
    ARRAY['recovery', 'post-surgery', 'cardiac'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Dr. Alpha's notes for Patient B (critical)
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'test-note-alpha-b-1',
    'test-patient-b-db-id',
    'test-doctor-alpha-db-id',
    'emergency',
    'URGENT: Complications Post Heart Valve Surgery',
    'Patient experiencing elevated temperature (101.2°F) and increased pain levels (8/10). Chest pain and shortness of breath reported. Immediate evaluation required. Consider adjusting pain management protocol and monitoring for signs of infection or cardiac complications.',
    true,
    ARRAY['urgent', 'complications', 'cardiac', 'pain-management'],
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  );

-- Dr. Beta's notes for Patient C
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'test-note-beta-c-1',
    'test-patient-c-db-id',
    'test-doctor-beta-db-id',
    'consultation',
    'Hip Replacement Recovery Progress',
    'Patient showing excellent progress with hip replacement recovery. Range of motion improving daily. Physical therapy sessions are effective. Patient is motivated and compliant with exercise regimen. Continue current treatment plan.',
    false,
    ARRAY['orthopedic', 'recovery', 'physical-therapy'],
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  );

-- Dr. Beta's notes for Patient D
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'test-note-beta-d-1',
    'test-patient-d-db-id',
    'test-doctor-beta-db-id',
    'observation',
    'Knee Replacement - Week 1 Assessment',
    'Patient adapting well to knee replacement. Mild swelling is expected and within normal range. Pain management is effective. Patient demonstrates good understanding of post-operative care instructions. Schedule follow-up in one week.',
    false,
    ARRAY['orthopedic', 'knee-replacement', 'post-op'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Dr. Gamma's notes for Patient E
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'test-note-gamma-e-1',
    'test-patient-e-db-id',
    'test-doctor-gamma-db-id',
    'follow_up',
    'Laparoscopic Gallbladder Removal - Post-Op Day 3',
    'Minimally invasive gallbladder removal completed successfully. Patient reports no pain and is tolerating regular diet well. Incision sites are clean and dry. Patient can resume normal activities gradually. Excellent recovery progress.',
    false,
    ARRAY['laparoscopic', 'gallbladder', 'minimal-invasive'],
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  );

-- ============================================================================
-- 6. CREATE TEST ADMIN USER
-- ============================================================================

-- Test Admin User (for testing admin privileges)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  'test-admin-uuid',
  'admin@test.connectcare.ai',
  'Test Admin User',
  'admin',
  '+91 98765 99999',
  'ConnectCare AI Headquarters, Mumbai',
  NOW(),
  NOW()
);

-- ============================================================================
-- 7. CREATE TEST NURSE USER
-- ============================================================================

-- Test Nurse User (for testing nurse privileges)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  'test-nurse-uuid',
  'nurse@test.connectcare.ai',
  'Test Nurse User',
  'nurse',
  '+91 98765 88888',
  'Test Hospital, Mumbai, Maharashtra',
  NOW(),
  NOW()
);

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================

-- Verify test data creation
DO $$
DECLARE
  doctor_count integer;
  patient_count integer;
  checkin_count integer;
  note_count integer;
BEGIN
  -- Count test records
  SELECT COUNT(*) INTO doctor_count FROM doctors WHERE license_number LIKE 'TEST-%';
  SELECT COUNT(*) INTO patient_count FROM patients WHERE patient_id LIKE 'TEST-%';
  SELECT COUNT(*) INTO checkin_count FROM daily_checkins WHERE patient_id IN (
    SELECT id FROM patients WHERE patient_id LIKE 'TEST-%'
  );
  SELECT COUNT(*) INTO note_count FROM doctor_notes WHERE patient_id IN (
    SELECT id FROM patients WHERE patient_id LIKE 'TEST-%'
  );
  
  -- Log results
  RAISE NOTICE '✅ Test data seeding completed successfully!';
  RAISE NOTICE '📊 Test Data Summary:';
  RAISE NOTICE '   - Doctors: % (Expected: 3)', doctor_count;
  RAISE NOTICE '   - Patients: % (Expected: 5)', patient_count;
  RAISE NOTICE '   - Check-ins: % (Expected: 5)', checkin_count;
  RAISE NOTICE '   - Doctor Notes: % (Expected: 5)', note_count;
  RAISE NOTICE '   - Admin Users: 1';
  RAISE NOTICE '   - Nurse Users: 1';
  
  -- Verify assignments
  RAISE NOTICE '👨‍⚕️ Doctor-Patient Assignments:';
  RAISE NOTICE '   - Dr. Alpha: Patients A, B (2 patients)';
  RAISE NOTICE '   - Dr. Beta: Patients C, D (2 patients)';
  RAISE NOTICE '   - Dr. Gamma: Patient E (1 patient)';
  
  -- Verify critical cases
  RAISE NOTICE '🚨 Critical Cases: Patient B (chest pain, fever)';
  
  RAISE NOTICE '🧪 Test environment is ready for testing!';
END $$;

-- Display test user credentials for reference
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 TEST USER CREDENTIALS (for manual testing):';
  RAISE NOTICE '';
  RAISE NOTICE 'DOCTORS:';
  RAISE NOTICE '  Dr. Alpha: doctor.alpha@test.connectcare.ai';
  RAISE NOTICE '  Dr. Beta:  doctor.beta@test.connectcare.ai';
  RAISE NOTICE '  Dr. Gamma: doctor.gamma@test.connectcare.ai';
  RAISE NOTICE '';
  RAISE NOTICE 'PATIENTS:';
  RAISE NOTICE '  Patient A: patient.a@test.connectcare.ai';
  RAISE NOTICE '  Patient B: patient.b@test.connectcare.ai (CRITICAL)';
  RAISE NOTICE '  Patient C: patient.c@test.connectcare.ai';
  RAISE NOTICE '  Patient D: patient.d@test.connectcare.ai';
  RAISE NOTICE '  Patient E: patient.e@test.connectcare.ai';
  RAISE NOTICE '';
  RAISE NOTICE 'ADMIN/STAFF:';
  RAISE NOTICE '  Admin:     admin@test.connectcare.ai';
  RAISE NOTICE '  Nurse:     nurse@test.connectcare.ai';
  RAISE NOTICE '';
  RAISE NOTICE 'Default Password: testpass123 (set during auth.users creation)';
  RAISE NOTICE '';
END $$;
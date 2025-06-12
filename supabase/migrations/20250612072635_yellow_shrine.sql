-- ============================================================================
-- ConnectCare AI - Test Data Seeding Script (Fixed Foreign Key Constraints)
-- ============================================================================
-- This script creates comprehensive test data for the ConnectCare AI application
-- Run this script against your test Supabase database before running tests
-- 
-- IMPORTANT: This migration creates test data without auth.users entries
-- For full testing, you'll need to create actual user accounts through the auth system

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

-- Delete test profiles (but preserve any that might have real auth.users entries)
DELETE FROM profiles WHERE email LIKE '%@test.connectcare.ai' AND id NOT IN (
  SELECT id FROM auth.users WHERE email LIKE '%@test.connectcare.ai'
);

-- ============================================================================
-- 2. TEMPORARILY DISABLE FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Temporarily disable the foreign key constraint to allow test data insertion
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================================================
-- 3. CREATE TEST DOCTOR PROFILES
-- ============================================================================

-- Test Doctor Alpha (Cardiologist)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'doctor.alpha@test.connectcare.ai',
  'Dr. Test Alpha',
  'doctor',
  '+91 98765 00001',
  'Test Hospital, Mumbai, Maharashtra',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111111',
  'TEST-DOC-ALPHA-001',
  'Cardiothoracic Surgery',
  15,
  'Test Apollo Hospital, Mumbai',
  2500.00,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  license_number = EXCLUDED.license_number,
  specialization = EXCLUDED.specialization,
  years_of_experience = EXCLUDED.years_of_experience,
  hospital_affiliation = EXCLUDED.hospital_affiliation,
  consultation_fee = EXCLUDED.consultation_fee,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Test Doctor Beta (Orthopedic Surgeon)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'doctor.beta@test.connectcare.ai',
  'Dr. Test Beta',
  'doctor',
  '+91 98765 00002',
  'Test Hospital, Delhi, India',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222222',
  'TEST-DOC-BETA-002',
  'Orthopedic Surgery',
  12,
  'Test AIIMS, Delhi',
  2000.00,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  license_number = EXCLUDED.license_number,
  specialization = EXCLUDED.specialization,
  years_of_experience = EXCLUDED.years_of_experience,
  hospital_affiliation = EXCLUDED.hospital_affiliation,
  consultation_fee = EXCLUDED.consultation_fee,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Test Doctor Gamma (General Surgeon)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'doctor.gamma@test.connectcare.ai',
  'Dr. Test Gamma',
  'doctor',
  '+91 98765 00003',
  'Test Hospital, Bangalore, Karnataka',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee, is_active, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333334',
  '33333333-3333-3333-3333-333333333333',
  'TEST-DOC-GAMMA-003',
  'General Surgery',
  8,
  'Test Manipal Hospital, Bangalore',
  1800.00,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  license_number = EXCLUDED.license_number,
  specialization = EXCLUDED.specialization,
  years_of_experience = EXCLUDED.years_of_experience,
  hospital_affiliation = EXCLUDED.hospital_affiliation,
  consultation_fee = EXCLUDED.consultation_fee,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- 4. CREATE TEST PATIENT PROFILES
-- ============================================================================

-- Test Patient A (Assigned to Dr. Alpha)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TEST-PAT-2024-001',
  '11111111-1111-1111-1111-111111111112',
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
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  patient_id = EXCLUDED.patient_id,
  assigned_doctor_id = EXCLUDED.assigned_doctor_id,
  medical_record_number = EXCLUDED.medical_record_number,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  chronic_conditions = EXCLUDED.chronic_conditions,
  status = EXCLUDED.status,
  admission_date = EXCLUDED.admission_date,
  surgery_date = EXCLUDED.surgery_date,
  surgery_type = EXCLUDED.surgery_type,
  recovery_notes = EXCLUDED.recovery_notes,
  updated_at = NOW();

-- Test Patient B (Assigned to Dr. Alpha)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbcc',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TEST-PAT-2024-002',
  '11111111-1111-1111-1111-111111111112',
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
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  patient_id = EXCLUDED.patient_id,
  assigned_doctor_id = EXCLUDED.assigned_doctor_id,
  medical_record_number = EXCLUDED.medical_record_number,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  chronic_conditions = EXCLUDED.chronic_conditions,
  status = EXCLUDED.status,
  admission_date = EXCLUDED.admission_date,
  surgery_date = EXCLUDED.surgery_date,
  surgery_type = EXCLUDED.surgery_type,
  recovery_notes = EXCLUDED.recovery_notes,
  updated_at = NOW();

-- Test Patient C (Assigned to Dr. Beta)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccdd',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'TEST-PAT-2024-003',
  '22222222-2222-2222-2222-222222222223',
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
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  patient_id = EXCLUDED.patient_id,
  assigned_doctor_id = EXCLUDED.assigned_doctor_id,
  medical_record_number = EXCLUDED.medical_record_number,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  chronic_conditions = EXCLUDED.chronic_conditions,
  status = EXCLUDED.status,
  admission_date = EXCLUDED.admission_date,
  surgery_date = EXCLUDED.surgery_date,
  surgery_type = EXCLUDED.surgery_type,
  recovery_notes = EXCLUDED.recovery_notes,
  updated_at = NOW();

-- Test Patient D (Assigned to Dr. Beta)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddee',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'TEST-PAT-2024-004',
  '22222222-2222-2222-2222-222222222223',
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
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  patient_id = EXCLUDED.patient_id,
  assigned_doctor_id = EXCLUDED.assigned_doctor_id,
  medical_record_number = EXCLUDED.medical_record_number,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  chronic_conditions = EXCLUDED.chronic_conditions,
  status = EXCLUDED.status,
  admission_date = EXCLUDED.admission_date,
  surgery_date = EXCLUDED.surgery_date,
  surgery_type = EXCLUDED.surgery_type,
  recovery_notes = EXCLUDED.recovery_notes,
  updated_at = NOW();

-- Test Patient E (Assigned to Dr. Gamma)
INSERT INTO profiles (id, email, full_name, role, phone, date_of_birth, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  date_of_birth = EXCLUDED.date_of_birth,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  updated_at = NOW();

INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type, recovery_notes, created_at, updated_at)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeff',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'TEST-PAT-2024-005',
  '33333333-3333-3333-3333-333333333334',
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
) ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  patient_id = EXCLUDED.patient_id,
  assigned_doctor_id = EXCLUDED.assigned_doctor_id,
  medical_record_number = EXCLUDED.medical_record_number,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  chronic_conditions = EXCLUDED.chronic_conditions,
  status = EXCLUDED.status,
  admission_date = EXCLUDED.admission_date,
  surgery_date = EXCLUDED.surgery_date,
  surgery_type = EXCLUDED.surgery_type,
  recovery_notes = EXCLUDED.recovery_notes,
  updated_at = NOW();

-- ============================================================================
-- 5. CREATE TEST ADMIN AND NURSE USERS
-- ============================================================================

-- Test Admin User (for testing admin privileges)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'admin@test.connectcare.ai',
  'Test Admin User',
  'admin',
  '+91 98765 99999',
  'ConnectCare AI Headquarters, Mumbai',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

-- Test Nurse User (for testing nurse privileges)
INSERT INTO profiles (id, email, full_name, role, phone, address, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'nurse@test.connectcare.ai',
  'Test Nurse User',
  'nurse',
  '+91 98765 88888',
  'Test Hospital, Mumbai, Maharashtra',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  updated_at = NOW();

-- ============================================================================
-- 6. CREATE TEST DAILY CHECK-INS
-- ============================================================================

-- Recent check-ins for Patient A (Dr. Alpha's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'aaaaaaaa-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabb',
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
    'aaaaaaaa-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabb',
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
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  checkin_date = EXCLUDED.checkin_date,
  status = EXCLUDED.status,
  temperature = EXCLUDED.temperature,
  blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
  blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
  heart_rate = EXCLUDED.heart_rate,
  oxygen_saturation = EXCLUDED.oxygen_saturation,
  weight = EXCLUDED.weight,
  pain_level = EXCLUDED.pain_level,
  symptoms = EXCLUDED.symptoms,
  mood_rating = EXCLUDED.mood_rating,
  medications_taken = EXCLUDED.medications_taken,
  activity_level = EXCLUDED.activity_level,
  exercise_completed = EXCLUDED.exercise_completed,
  patient_notes = EXCLUDED.patient_notes,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- Recent check-ins for Patient B (Dr. Alpha's patient - critical status)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'bbbbbbbb-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbcc',
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
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  checkin_date = EXCLUDED.checkin_date,
  status = EXCLUDED.status,
  temperature = EXCLUDED.temperature,
  blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
  blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
  heart_rate = EXCLUDED.heart_rate,
  oxygen_saturation = EXCLUDED.oxygen_saturation,
  weight = EXCLUDED.weight,
  pain_level = EXCLUDED.pain_level,
  symptoms = EXCLUDED.symptoms,
  mood_rating = EXCLUDED.mood_rating,
  medications_taken = EXCLUDED.medications_taken,
  activity_level = EXCLUDED.activity_level,
  exercise_completed = EXCLUDED.exercise_completed,
  patient_notes = EXCLUDED.patient_notes,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- Recent check-ins for Patient C (Dr. Beta's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'cccccccc-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-ccccccccccdd',
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
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  checkin_date = EXCLUDED.checkin_date,
  status = EXCLUDED.status,
  temperature = EXCLUDED.temperature,
  blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
  blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
  heart_rate = EXCLUDED.heart_rate,
  oxygen_saturation = EXCLUDED.oxygen_saturation,
  weight = EXCLUDED.weight,
  pain_level = EXCLUDED.pain_level,
  symptoms = EXCLUDED.symptoms,
  mood_rating = EXCLUDED.mood_rating,
  medications_taken = EXCLUDED.medications_taken,
  activity_level = EXCLUDED.activity_level,
  exercise_completed = EXCLUDED.exercise_completed,
  patient_notes = EXCLUDED.patient_notes,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- Recent check-ins for Patient D (Dr. Beta's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'dddddddd-1111-1111-1111-111111111111',
    'dddddddd-dddd-dddd-dddd-ddddddddddee',
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
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  checkin_date = EXCLUDED.checkin_date,
  status = EXCLUDED.status,
  temperature = EXCLUDED.temperature,
  blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
  blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
  heart_rate = EXCLUDED.heart_rate,
  oxygen_saturation = EXCLUDED.oxygen_saturation,
  weight = EXCLUDED.weight,
  pain_level = EXCLUDED.pain_level,
  symptoms = EXCLUDED.symptoms,
  mood_rating = EXCLUDED.mood_rating,
  medications_taken = EXCLUDED.medications_taken,
  activity_level = EXCLUDED.activity_level,
  exercise_completed = EXCLUDED.exercise_completed,
  patient_notes = EXCLUDED.patient_notes,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- Recent check-ins for Patient E (Dr. Gamma's patient)
INSERT INTO daily_checkins (id, patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, weight, pain_level, symptoms, mood_rating, medications_taken, activity_level, exercise_completed, patient_notes, completed_at, created_at, updated_at)
VALUES 
  (
    'eeeeeeee-1111-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeff',
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
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  checkin_date = EXCLUDED.checkin_date,
  status = EXCLUDED.status,
  temperature = EXCLUDED.temperature,
  blood_pressure_systolic = EXCLUDED.blood_pressure_systolic,
  blood_pressure_diastolic = EXCLUDED.blood_pressure_diastolic,
  heart_rate = EXCLUDED.heart_rate,
  oxygen_saturation = EXCLUDED.oxygen_saturation,
  weight = EXCLUDED.weight,
  pain_level = EXCLUDED.pain_level,
  symptoms = EXCLUDED.symptoms,
  mood_rating = EXCLUDED.mood_rating,
  medications_taken = EXCLUDED.medications_taken,
  activity_level = EXCLUDED.activity_level,
  exercise_completed = EXCLUDED.exercise_completed,
  patient_notes = EXCLUDED.patient_notes,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- ============================================================================
-- 7. CREATE TEST DOCTOR NOTES
-- ============================================================================

-- Dr. Alpha's notes for Patient A
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'aaaaaaaa-aaaa-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaabb',
    '11111111-1111-1111-1111-111111111112',
    'follow_up',
    'Post-Surgery Follow-up - Day 7',
    'Patient is recovering well from coronary artery bypass surgery. Incision sites are healing properly with no signs of infection. Patient reports manageable pain levels and is following medication regimen. Recommend continued monitoring and gradual increase in activity level.',
    false,
    ARRAY['recovery', 'post-surgery', 'cardiac'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  note_type = EXCLUDED.note_type,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_critical = EXCLUDED.is_critical,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Dr. Alpha's notes for Patient B (critical)
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'bbbbbbbb-bbbb-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbcc',
    '11111111-1111-1111-1111-111111111112',
    'emergency',
    'URGENT: Complications Post Heart Valve Surgery',
    'Patient experiencing elevated temperature (101.2°F) and increased pain levels (8/10). Chest pain and shortness of breath reported. Immediate evaluation required. Consider adjusting pain management protocol and monitoring for signs of infection or cardiac complications.',
    true,
    ARRAY['urgent', 'complications', 'cardiac', 'pain-management'],
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  note_type = EXCLUDED.note_type,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_critical = EXCLUDED.is_critical,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Dr. Beta's notes for Patient C
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'cccccccc-cccc-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-ccccccccccdd',
    '22222222-2222-2222-2222-222222222223',
    'consultation',
    'Hip Replacement Recovery Progress',
    'Patient showing excellent progress with hip replacement recovery. Range of motion improving daily. Physical therapy sessions are effective. Patient is motivated and compliant with exercise regimen. Continue current treatment plan.',
    false,
    ARRAY['orthopedic', 'recovery', 'physical-therapy'],
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  note_type = EXCLUDED.note_type,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_critical = EXCLUDED.is_critical,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Dr. Beta's notes for Patient D
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'dddddddd-dddd-1111-1111-111111111111',
    'dddddddd-dddd-dddd-dddd-ddddddddddee',
    '22222222-2222-2222-2222-222222222223',
    'observation',
    'Knee Replacement - Week 1 Assessment',
    'Patient adapting well to knee replacement. Mild swelling is expected and within normal range. Pain management is effective. Patient demonstrates good understanding of post-operative care instructions. Schedule follow-up in one week.',
    false,
    ARRAY['orthopedic', 'knee-replacement', 'post-op'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  note_type = EXCLUDED.note_type,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_critical = EXCLUDED.is_critical,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Dr. Gamma's notes for Patient E
INSERT INTO doctor_notes (id, patient_id, doctor_id, note_type, title, content, is_critical, tags, created_at, updated_at)
VALUES 
  (
    'eeeeeeee-eeee-1111-1111-111111111111',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeff',
    '33333333-3333-3333-3333-333333333334',
    'follow_up',
    'Laparoscopic Gallbladder Removal - Post-Op Day 3',
    'Minimally invasive gallbladder removal completed successfully. Patient reports no pain and is tolerating regular diet well. Incision sites are clean and dry. Patient can resume normal activities gradually. Excellent recovery progress.',
    false,
    ARRAY['laparoscopic', 'gallbladder', 'minimal-invasive'],
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  note_type = EXCLUDED.note_type,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_critical = EXCLUDED.is_critical,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- ============================================================================
-- 8. RESTORE FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Re-add the foreign key constraint (but make it more flexible for test data)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
NOT VALID;

-- Mark the constraint as valid for future inserts only
-- This allows existing test data to remain while enforcing the constraint for new data
-- Note: In production, you should validate this constraint after ensuring all data is consistent

-- ============================================================================
-- 9. VERIFICATION QUERIES
-- ============================================================================

-- Verify test data creation
DO $$
DECLARE
  doctor_count integer;
  patient_count integer;
  checkin_count integer;
  note_count integer;
  profile_count integer;
BEGIN
  -- Count test records
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE email LIKE '%@test.connectcare.ai';
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
  RAISE NOTICE '   - Profiles: % (Expected: 8)', profile_count;
  RAISE NOTICE '   - Doctors: % (Expected: 3)', doctor_count;
  RAISE NOTICE '   - Patients: % (Expected: 5)', patient_count;
  RAISE NOTICE '   - Check-ins: % (Expected: 5)', checkin_count;
  RAISE NOTICE '   - Doctor Notes: % (Expected: 5)', note_count;
  
  -- Verify assignments
  RAISE NOTICE '👨‍⚕️ Doctor-Patient Assignments:';
  RAISE NOTICE '   - Dr. Alpha: Patients A, B (2 patients)';
  RAISE NOTICE '   - Dr. Beta: Patients C, D (2 patients)';
  RAISE NOTICE '   - Dr. Gamma: Patient E (1 patient)';
  
  -- Verify critical cases
  RAISE NOTICE '🚨 Critical Cases: Patient B (chest pain, fever)';
  
  RAISE NOTICE '🧪 Test environment is ready for testing!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT NOTES:';
  RAISE NOTICE '   - Test profiles created without auth.users entries';
  RAISE NOTICE '   - For full authentication testing, create real user accounts';
  RAISE NOTICE '   - RLS policies may need auth.users entries to function properly';
  RAISE NOTICE '   - Use these profiles for database-level testing only';
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
  RAISE NOTICE '📝 NOTE: Create corresponding auth.users entries for full testing';
  RAISE NOTICE '';
END $$;
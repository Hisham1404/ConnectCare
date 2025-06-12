/*
  # Complete ConnectCare AI Database Schema Migration
  
  This is a comprehensive, idempotent migration script that sets up the entire
  ConnectCare database schema with all necessary tables, functions, triggers,
  security policies, and sample data.
  
  1. Schema Setup
    - Custom ENUM types for standardized values
    - Core tables: profiles, doctors, patients, doctor_notes, daily_checkins
    - Proper foreign key relationships and constraints
    - Performance indexes
  
  2. Security & RLS
    - Row Level Security enabled on all tables
    - Role-based access control policies
    - Secure user registration flow
  
  3. Automation
    - Automatic profile creation on user signup
    - Timestamp management triggers
    - Role-specific record creation
  
  4. Sample Data
    - 4 sample doctors with different specializations
    - 6 sample patients assigned to doctors
    - Sample daily check-ins and doctor notes
    - Realistic medical data for testing
*/

-- ============================================================================
-- 1. CUSTOM TYPES
-- ============================================================================

-- Create custom ENUM types (idempotent)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'patient');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE patient_status AS ENUM ('active', 'critical', 'discharged', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE checkin_status AS ENUM ('completed', 'missed', 'overdue', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE note_type AS ENUM ('consultation', 'emergency', 'follow_up', 'observation', 'prescription');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url text,
  date_of_birth date,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  specialization text NOT NULL,
  years_of_experience integer DEFAULT 0,
  hospital_affiliation text,
  consultation_fee decimal(10,2),
  available_hours jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id text UNIQUE NOT NULL,
  assigned_doctor_id uuid REFERENCES doctors(id),
  medical_record_number text UNIQUE,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  current_medications jsonb,
  insurance_info jsonb,
  status patient_status DEFAULT 'active',
  admission_date date,
  discharge_date date,
  surgery_date date,
  surgery_type text,
  recovery_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doctor notes table
CREATE TABLE IF NOT EXISTS doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  note_type note_type DEFAULT 'observation',
  title text NOT NULL,
  content text NOT NULL,
  is_critical boolean DEFAULT false,
  attachments jsonb,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  checkin_date date NOT NULL,
  status checkin_status DEFAULT 'pending',
  
  -- Vital signs
  temperature decimal(4,1),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  oxygen_saturation integer,
  weight decimal(5,2),
  
  -- Symptoms and pain
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  symptoms text[],
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  
  -- Medication compliance
  medications_taken boolean DEFAULT false,
  missed_medications text[],
  
  -- Activity and mobility
  activity_level text,
  mobility_issues text,
  exercise_completed boolean DEFAULT false,
  
  -- Additional notes
  patient_notes text,
  ai_analysis jsonb,
  
  -- Timestamps
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one checkin per patient per day
  UNIQUE(patient_id, checkin_date)
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Doctors indexes
CREATE INDEX IF NOT EXISTS idx_doctors_profile_id ON doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Doctor notes indexes
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON doctor_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_created_at ON doctor_notes(created_at);

-- Daily checkins indexes
CREATE INDEX IF NOT EXISTS idx_daily_checkins_patient_id ON daily_checkins(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_status ON daily_checkins(status);

-- ============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name text;
  user_role user_role;
  user_email text;
BEGIN
  -- Extract user data with safe fallbacks
  user_email := NEW.email;
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'patient'::user_role
  );

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, user_email, user_full_name, user_role);
  
  -- Create role-specific record
  IF user_role = 'doctor' THEN
    INSERT INTO public.doctors (profile_id, license_number, specialization)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'license_number', 'TEMP-' || NEW.id::text),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Practice')
    );
  ELSIF user_role = 'patient' THEN
    INSERT INTO public.patients (profile_id, patient_id)
    VALUES (
      NEW.id,
      'PAT-' || EXTRACT(YEAR FROM now()) || '-' || LPAD((EXTRACT(DOY FROM now()))::text, 3, '0') || '-' || SUBSTRING(NEW.id::text, 1, 6)
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers and recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated timestamp triggers
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_doctors_updated_at ON doctors;
CREATE TRIGGER handle_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_patients_updated_at ON patients;
CREATE TRIGGER handle_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_doctor_notes_updated_at ON doctor_notes;
CREATE TRIGGER handle_doctor_notes_updated_at
  BEFORE UPDATE ON doctor_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_daily_checkins_updated_at ON daily_checkins;
CREATE TRIGGER handle_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for anon users during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Enable insert for authenticated users during signup"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for anon users during signup"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for service role"
  ON profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- Doctors policies
DROP POLICY IF EXISTS "Doctors can read own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own data" ON doctors;
DROP POLICY IF EXISTS "Enable doctor creation during signup" ON doctors;

CREATE POLICY "Doctors can read own data"
  ON doctors FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor')));

CREATE POLICY "Doctors can update own data"
  ON doctors FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Enable doctor creation during signup"
  ON doctors FOR INSERT TO service_role, authenticated, anon
  WITH CHECK (true);

-- Patients policies
DROP POLICY IF EXISTS "Patients can read own data" ON patients;
DROP POLICY IF EXISTS "Patients can update own data" ON patients;
DROP POLICY IF EXISTS "Doctors can update assigned patients" ON patients;
DROP POLICY IF EXISTS "Enable patient creation during signup" ON patients;

CREATE POLICY "Patients can read own data"
  ON patients FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid() OR
    assigned_doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'nurse'))
  );

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Doctors can update assigned patients"
  ON patients FOR UPDATE TO authenticated
  USING (assigned_doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()));

CREATE POLICY "Enable patient creation during signup"
  ON patients FOR INSERT TO service_role, authenticated, anon
  WITH CHECK (true);

-- Doctor notes policies
DROP POLICY IF EXISTS "Doctors can manage notes for assigned patients" ON doctor_notes;
DROP POLICY IF EXISTS "Patients can read their medical notes" ON doctor_notes;

CREATE POLICY "Doctors can manage notes for assigned patients"
  ON doctor_notes FOR ALL TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE profile_id = auth.uid()));

CREATE POLICY "Patients can read their medical notes"
  ON doctor_notes FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()));

-- Daily checkins policies
DROP POLICY IF EXISTS "Patients can manage own checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Doctors can read assigned patients checkins" ON daily_checkins;

CREATE POLICY "Patients can manage own checkins"
  ON daily_checkins FOR ALL TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()));

CREATE POLICY "Doctors can read assigned patients checkins"
  ON daily_checkins FOR SELECT TO authenticated
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN doctors d ON p.assigned_doctor_id = d.id
      WHERE d.profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample doctor profiles (using ON CONFLICT to make idempotent)
INSERT INTO profiles (id, email, full_name, role, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'dr.rajesh@connectcare.ai', 'Dr. Rajesh Kumar', 'doctor', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('22222222-2222-2222-2222-222222222222', 'dr.priya@connectcare.ai', 'Dr. Priya Sharma', 'doctor', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('33333333-3333-3333-3333-333333333333', 'dr.amit@connectcare.ai', 'Dr. Amit Patel', 'doctor', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
  ('44444444-4444-4444-4444-444444444444', 'dr.sunita@connectcare.ai', 'Dr. Sunita Gupta', 'doctor', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (id, profile_id, license_number, specialization, years_of_experience, hospital_affiliation, consultation_fee) VALUES
  ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MH-DOC-2024-001', 'Cardiothoracic Surgery', 15, 'Apollo Hospital, Mumbai', 2500.00),
  ('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'MH-DOC-2024-002', 'Cardiology', 12, 'Fortis Hospital, Mumbai', 2000.00),
  ('d3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'MH-DOC-2024-003', 'General Surgery', 10, 'Lilavati Hospital, Mumbai', 1800.00),
  ('d4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'MH-DOC-2024-004', 'Orthopedic Surgery', 8, 'Hinduja Hospital, Mumbai', 2200.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample patient profiles
INSERT INTO profiles (id, email, full_name, role, avatar_url, date_of_birth, address, emergency_contact_name, emergency_contact_phone) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ravi.mehta@email.com', 'Ravi Mehta', 'patient', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1975-03-15', 'Andheri West, Mumbai', 'Sunita Mehta', '+91 98765 43221'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'kavya.singh@email.com', 'Kavya Singh', 'patient', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1982-07-22', 'Bandra East, Mumbai', 'Vikram Singh', '+91 98765 43222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'arjun.reddy@email.com', 'Arjun Reddy', 'patient', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1968-11-08', 'Powai, Mumbai', 'Meera Reddy', '+91 98765 43223'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'meera.joshi@email.com', 'Meera Joshi', 'patient', 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1990-05-12', 'Juhu, Mumbai', 'Raj Joshi', '+91 98765 43224'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'vikram.agarwal@email.com', 'Vikram Agarwal', 'patient', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1985-09-30', 'Worli, Mumbai', 'Priya Agarwal', '+91 98765 43225'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'anita.desai@email.com', 'Anita Desai', 'patient', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', '1978-12-03', 'Colaba, Mumbai', 'Suresh Desai', '+91 98765 43226')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (id, profile_id, patient_id, assigned_doctor_id, medical_record_number, blood_type, allergies, chronic_conditions, status, admission_date, surgery_date, surgery_type) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PAT-2024-001', 'd1111111-1111-1111-1111-111111111111', 'MRN-001-2024', 'O+', ARRAY['Penicillin'], ARRAY['Hypertension'], 'active', '2024-12-01', '2024-12-05', 'Coronary Artery Bypass'),
  ('p2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PAT-2024-002', 'd2222222-2222-2222-2222-222222222222', 'MRN-002-2024', 'A+', ARRAY['Shellfish'], ARRAY['Diabetes Type 2'], 'active', '2024-12-03', '2024-12-07', 'Angioplasty'),
  ('p3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'PAT-2024-003', 'd3333333-3333-3333-3333-333333333333', 'MRN-003-2024', 'B+', ARRAY[]::text[], ARRAY['High Cholesterol'], 'critical', '2024-12-05', '2024-12-08', 'Gallbladder Removal'),
  ('p4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'PAT-2024-004', 'd4444444-4444-4444-4444-444444444444', 'MRN-004-2024', 'AB+', ARRAY['Latex'], ARRAY['Arthritis'], 'active', '2024-12-08', '2024-12-10', 'Hip Replacement'),
  ('p5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PAT-2024-005', 'd1111111-1111-1111-1111-111111111111', 'MRN-005-2024', 'O-', ARRAY['Aspirin'], ARRAY['Hypertension'], 'active', '2024-12-06', '2024-12-09', 'Valve Replacement'),
  ('p6666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'PAT-2024-006', 'd2222222-2222-2222-2222-222222222222', 'MRN-006-2024', 'A-', ARRAY[]::text[], ARRAY[]::text[], 'active', '2024-12-09', '2024-12-11', 'Pacemaker Implantation')
ON CONFLICT (id) DO NOTHING;

-- Insert sample daily check-ins
INSERT INTO daily_checkins (patient_id, checkin_date, status, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, oxygen_saturation, pain_level, mood_rating, medications_taken, patient_notes, completed_at) VALUES
  ('p1111111-1111-1111-1111-111111111111', CURRENT_DATE, 'completed', 98.6, 120, 80, 72, 98, 3, 4, true, 'Feeling much better today. Pain is manageable and I was able to walk around the house.', now() - interval '2 hours'),
  ('p1111111-1111-1111-1111-111111111111', CURRENT_DATE - 1, 'completed', 99.1, 125, 85, 78, 97, 4, 3, true, 'Some discomfort but overall improving. Took all medications on time.', now() - interval '1 day 3 hours'),
  ('p2222222-2222-2222-2222-222222222222', CURRENT_DATE, 'completed', 98.4, 118, 75, 68, 99, 2, 5, true, 'Excellent day! No chest pain and feeling very energetic.', now() - interval '1 hour'),
  ('p3333333-3333-3333-3333-333333333333', CURRENT_DATE, 'completed', 101.2, 140, 95, 88, 94, 6, 2, false, 'Not feeling well today. Nausea and dizziness. Forgot morning medication.', now() - interval '30 minutes'),
  ('p4444444-4444-4444-4444-444444444444', CURRENT_DATE, 'completed', 98.8, 115, 70, 65, 98, 4, 4, true, 'Physical therapy went well. Some stiffness but mobility is improving.', now() - interval '4 hours'),
  ('p5555555-5555-5555-5555-555555555555', CURRENT_DATE, 'pending', null, null, null, null, null, null, null, false, null, null),
  ('p6666666-6666-6666-6666-666666666666', CURRENT_DATE, 'completed', 98.2, 110, 70, 62, 99, 1, 5, true, 'Feeling fantastic! Pacemaker working perfectly. Ready to return to normal activities.', now() - interval '6 hours')
ON CONFLICT (patient_id, checkin_date) DO NOTHING;

-- Insert sample doctor notes
INSERT INTO doctor_notes (patient_id, doctor_id, note_type, title, content, is_critical, tags) VALUES
  ('p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'follow_up', 'Post-Surgery Recovery Assessment', 'Patient is recovering well from coronary artery bypass surgery. Vital signs are stable and within normal ranges. Pain management is effective. Continue current medication regimen and encourage gradual increase in physical activity.', false, ARRAY['recovery', 'cardiac', 'stable']),
  ('p3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'observation', 'Concerning Symptoms - Immediate Attention Required', 'Patient reported severe nausea, dizziness, and missed medications. Temperature elevated to 101.2°F. Blood pressure elevated. Recommend immediate evaluation and possible medication adjustment. Monitor closely for signs of infection.', true, ARRAY['critical', 'infection', 'medication']),
  ('p2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'consultation', 'Excellent Recovery Progress', 'Patient showing exceptional recovery from angioplasty procedure. All vital signs normal, no chest pain reported. Patient is highly compliant with medication regimen. Can begin cardiac rehabilitation program next week.', false, ARRAY['recovery', 'excellent', 'cardiac-rehab']),
  ('p4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'prescription', 'Pain Management Adjustment', 'Adjusted pain medication dosage based on patient feedback. Prescribed additional anti-inflammatory for joint stiffness. Physical therapy showing good results. Continue current rehabilitation plan.', false, ARRAY['pain-management', 'rehabilitation', 'orthopedic'])
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'ConnectCare AI database schema migration completed successfully!';
  RAISE NOTICE 'Created tables: profiles, doctors, patients, doctor_notes, daily_checkins';
  RAISE NOTICE 'Inserted sample data: 4 doctors, 6 patients, 7 check-ins, 4 doctor notes';
  RAISE NOTICE 'Configured RLS policies and automatic user registration';
END $$;
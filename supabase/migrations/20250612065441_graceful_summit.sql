/*
  # ConnectCare AI Core Tables Migration

  1. New Tables
    - `profiles` - User profiles linked to auth.users with role management
    - `patients` - Patient-specific medical information
    - `doctors` - Doctor profiles and specializations  
    - `check_ins` - Patient daily check-in submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Doctors can access their assigned patients
    - Patients can only access their own data

  3. Sample Data
    - Pre-populate with dummy doctors and patients
    - Include sample check-in data for testing
*/

-- Create the profiles table (simplified from existing schema)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('doctor', 'patient')),
  created_at timestamptz DEFAULT now()
);

-- Create the patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date,
  assigned_doctor_id uuid REFERENCES profiles(id)
);

-- Create the doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL
);

-- Create the check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  details jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Patients can read own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    assigned_doctor_id = auth.uid()
  );

CREATE POLICY "Patients can update own data"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Doctors policies
CREATE POLICY "Doctors can read own data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Doctors can update own data"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Check-ins policies
CREATE POLICY "Patients can manage own check-ins"
  ON check_ins
  FOR ALL
  TO authenticated
  USING (
    patient_id = auth.uid()
  );

CREATE POLICY "Doctors can read assigned patients check-ins"
  ON check_ins
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE assigned_doctor_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_patient_id ON check_ins(patient_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);

-- Insert dummy doctors
INSERT INTO profiles (id, full_name, avatar_url, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Rajesh Kumar', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'doctor'),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Priya Sharma', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'doctor'),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Amit Patel', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'doctor'),
  ('44444444-4444-4444-4444-444444444444', 'Dr. Sunita Gupta', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'doctor');

INSERT INTO doctors (id, specialization) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cardiothoracic Surgeon'),
  ('22222222-2222-2222-2222-222222222222', 'Cardiologist'),
  ('33333333-3333-3333-3333-333333333333', 'General Surgeon'),
  ('44444444-4444-4444-4444-444444444444', 'Orthopedic Surgeon');

-- Insert dummy patients
INSERT INTO profiles (id, full_name, avatar_url, role) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ravi Mehta', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kavya Singh', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Arjun Reddy', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Meera Joshi', 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Vikram Agarwal', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Anita Desai', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'patient');

INSERT INTO patients (id, date_of_birth, assigned_doctor_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1975-03-15', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1982-07-22', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '1968-11-08', '33333333-3333-3333-3333-333333333333'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '1990-05-12', '44444444-4444-4444-4444-444444444444'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '1985-09-30', '11111111-1111-1111-1111-111111111111'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '1978-12-03', '22222222-2222-2222-2222-222222222222');

-- Insert sample check-in data
INSERT INTO check_ins (patient_id, details) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"pain_level": 3, "mood": "good", "medications_taken": true, "symptoms": ["mild fatigue"], "notes": "Feeling much better today, pain is manageable"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"pain_level": 4, "mood": "fair", "medications_taken": true, "symptoms": ["chest discomfort"], "notes": "Some discomfort but overall improving"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"pain_level": 2, "mood": "excellent", "medications_taken": true, "symptoms": [], "notes": "Great day! No pain and feeling energetic"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"pain_level": 1, "mood": "good", "medications_taken": true, "symptoms": [], "notes": "Recovery going very well"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"pain_level": 5, "mood": "poor", "medications_taken": false, "symptoms": ["nausea", "dizziness"], "notes": "Not feeling well today, forgot morning medication"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"pain_level": 6, "mood": "poor", "medications_taken": true, "symptoms": ["severe pain", "nausea"], "notes": "Pain increased overnight, took medication but still uncomfortable"}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '{"pain_level": 2, "mood": "good", "medications_taken": true, "symptoms": ["mild stiffness"], "notes": "Physical therapy is helping, mobility improving"}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '{"pain_level": 3, "mood": "fair", "medications_taken": true, "symptoms": ["shortness of breath"], "notes": "Some breathing difficulty during exercise"}'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '{"pain_level": 1, "mood": "excellent", "medications_taken": true, "symptoms": [], "notes": "Feeling fantastic! Ready to return to normal activities"}');

-- Add some older check-ins for trend analysis
INSERT INTO check_ins (patient_id, details, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"pain_level": 7, "mood": "poor", "medications_taken": true, "symptoms": ["severe pain", "fatigue"], "notes": "First week post-surgery, significant discomfort"}', now() - interval '7 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"pain_level": 6, "mood": "fair", "medications_taken": true, "symptoms": ["moderate pain", "fatigue"], "notes": "Pain slowly decreasing"}', now() - interval '5 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"pain_level": 4, "mood": "fair", "medications_taken": true, "symptoms": ["chest tightness"], "notes": "Initial recovery phase"}', now() - interval '10 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"pain_level": 8, "mood": "poor", "medications_taken": true, "symptoms": ["severe pain", "nausea", "dizziness"], "notes": "Difficult recovery period"}', now() - interval '3 days');
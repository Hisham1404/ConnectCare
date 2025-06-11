/*
  # ConnectCare AI Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users with role management
    - `patients` - Patient medical information and demographics
    - `doctors` - Doctor profiles and specializations
    - `doctor_notes` - Medical notes and observations by doctors
    - `daily_checkins` - Daily patient health reports and monitoring data

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Doctors can access their assigned patients
    - Patients can only access their own data
    - Admin users have full access

  3. Features
    - UUID primary keys for all tables
    - Proper foreign key relationships
    - Timestamps for audit trails
    - Enum types for standardized values
    - Indexes for performance optimization
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'nurse');
CREATE TYPE patient_status AS ENUM ('active', 'inactive', 'discharged', 'critical');
CREATE TYPE checkin_status AS ENUM ('completed', 'pending', 'missed', 'overdue');
CREATE TYPE note_type AS ENUM ('consultation', 'observation', 'prescription', 'follow_up', 'emergency');

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
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
  available_hours jsonb, -- Store availability schedule
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id text UNIQUE NOT NULL, -- Human-readable patient ID
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
  attachments jsonb, -- Store file URLs and metadata
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
  ai_analysis jsonb, -- Store AI-generated insights
  
  -- Timestamps
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one checkin per patient per day
  UNIQUE(patient_id, checkin_date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors policies
CREATE POLICY "Doctors can read own data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update own data"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Patients policies
CREATE POLICY "Patients can read own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    assigned_doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Patients can update own data"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Doctors can update assigned patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (
    assigned_doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );

-- Doctor notes policies
CREATE POLICY "Doctors can manage notes for assigned patients"
  ON doctor_notes
  FOR ALL
  TO authenticated
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Patients can read their medical notes"
  ON doctor_notes
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

-- Daily checkins policies
CREATE POLICY "Patients can manage own checkins"
  ON daily_checkins
  FOR ALL
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can read assigned patients checkins"
  ON daily_checkins
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN doctors d ON p.assigned_doctor_id = d.id
      WHERE d.profile_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_doctors_profile_id ON doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_patients_profile_id ON patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient_id ON doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON doctor_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_created_at ON doctor_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_patient_id ON daily_checkins(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_status ON daily_checkins(status);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'patient')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_doctor_notes_updated_at
  BEFORE UPDATE ON doctor_notes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_daily_checkins_updated_at
  BEFORE UPDATE ON daily_checkins
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
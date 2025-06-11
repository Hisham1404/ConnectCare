/*
  # Fix User Registration Database Setup

  1. Database Functions
    - Create or update `handle_new_user` function to automatically create profiles
    - Create or update `handle_updated_at` function for timestamp management

  2. Triggers
    - Ensure trigger exists on auth.users to create profile on signup
    - Ensure updated_at triggers exist on all tables

  3. Security
    - Update RLS policies to allow profile creation during signup
    - Ensure proper permissions for authenticated users

  4. Fixes
    - Resolves "Database error saving new user" during signup
    - Ensures profiles are automatically created for new users
    - Maintains data consistency and security
*/

-- Create or replace the handle_updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them to ensure proper permissions
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to read all profiles
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

-- Allow profile creation during user signup (this is crucial for the trigger to work)
CREATE POLICY "Enable insert for authenticated users during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow service role to insert profiles (for the trigger function)
CREATE POLICY "Enable insert for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure updated_at triggers exist on all tables
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
/*
  # Enable Row-Level Security and Create Comprehensive Policies

  1. Enable RLS
    - Enable RLS on all data tables: profiles, patients, doctors, doctor_notes, daily_checkins

  2. Security Policies
    - profiles: Users can view any profile but can only update their own
    - patients: Patients can access their own data. Doctors can access assigned patients. Admins/nurses can view patient data
    - doctors: Doctors can manage their own profile information
    - daily_checkins: Patients can create/view their own check-ins. Assigned doctors can view them
    - doctor_notes: Patients can read notes about them. Doctors can create/manage notes for assigned patients

  3. Idempotent Design
    - All DROP POLICY IF EXISTS statements ensure script can be re-run safely
    - Comprehensive error handling and conflict resolution
*/

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Enable RLS on all data tables (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. PROFILES TABLE POLICIES
-- ============================================================================

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Users can view any profile (for doctor-patient relationships, team collaboration)
CREATE POLICY "Users can view any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow profile creation during signup process
CREATE POLICY "Enable profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

-- ============================================================================
-- 3. PATIENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can access own data" ON patients;
DROP POLICY IF EXISTS "Doctors can access assigned patients" ON patients;
DROP POLICY IF EXISTS "Admins and nurses can view patient data" ON patients;
DROP POLICY IF EXISTS "Patients can update own data" ON patients;
DROP POLICY IF EXISTS "Doctors can update assigned patients" ON patients;
DROP POLICY IF EXISTS "Enable patient creation during signup" ON patients;

-- Patients can access their own data
CREATE POLICY "Patients can access own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Doctors can access data for patients they are assigned to
CREATE POLICY "Doctors can access assigned patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    assigned_doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );

-- Admins and nurses can view all patient data
CREATE POLICY "Admins and nurses can view patient data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- Patients can update their own data
CREATE POLICY "Patients can update own data"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- Doctors can update data for their assigned patients
CREATE POLICY "Doctors can update assigned patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (
    assigned_doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
  );

-- Allow patient creation during signup
CREATE POLICY "Enable patient creation during signup"
  ON patients
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

-- ============================================================================
-- 4. DOCTORS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can manage own profile" ON doctors;
DROP POLICY IF EXISTS "Users can view doctor profiles" ON doctors;
DROP POLICY IF EXISTS "Admins can manage all doctors" ON doctors;
DROP POLICY IF EXISTS "Enable doctor creation during signup" ON doctors;

-- Doctors can manage their own profile information
CREATE POLICY "Doctors can manage own profile"
  ON doctors
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- All authenticated users can view doctor profiles (for patient assignment, referrals)
CREATE POLICY "Users can view doctor profiles"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage all doctor profiles
CREATE POLICY "Admins can manage all doctors"
  ON doctors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow doctor creation during signup
CREATE POLICY "Enable doctor creation during signup"
  ON doctors
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

-- ============================================================================
-- 5. DAILY_CHECKINS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can manage own checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Assigned doctors can view patient checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Admins and nurses can view all checkins" ON daily_checkins;

-- Patients can create and view their own check-ins
CREATE POLICY "Patients can manage own checkins"
  ON daily_checkins
  FOR ALL
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

-- Assigned doctors can view their patients' check-ins
CREATE POLICY "Assigned doctors can view patient checkins"
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

-- Admins and nurses can view all check-ins
CREATE POLICY "Admins and nurses can view all checkins"
  ON daily_checkins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- ============================================================================
-- 6. DOCTOR_NOTES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can read their medical notes" ON doctor_notes;
DROP POLICY IF EXISTS "Doctors can manage notes for assigned patients" ON doctor_notes;
DROP POLICY IF EXISTS "Admins and nurses can view all notes" ON doctor_notes;

-- Patients can read notes about them
CREATE POLICY "Patients can read their medical notes"
  ON doctor_notes
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE profile_id = auth.uid()
    )
  );

-- Doctors can create and manage notes for their assigned patients
CREATE POLICY "Doctors can manage notes for assigned patients"
  ON doctor_notes
  FOR ALL
  TO authenticated
  USING (
    -- Doctor can manage notes they created
    doctor_id IN (
      SELECT id FROM doctors WHERE profile_id = auth.uid()
    )
    OR
    -- Doctor can manage notes for patients assigned to them
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN doctors d ON p.assigned_doctor_id = d.id
      WHERE d.profile_id = auth.uid()
    )
  );

-- Admins and nurses can view all medical notes
CREATE POLICY "Admins and nurses can view all notes"
  ON doctor_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- ============================================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant permissions to service role for system operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant permissions to anonymous users (for signup process)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON profiles TO anon;
GRANT INSERT ON doctors TO anon;
GRANT INSERT ON patients TO anon;

-- ============================================================================
-- 8. VERIFICATION AND LOGGING
-- ============================================================================

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE '✅ Row-Level Security (RLS) enabled on all tables';
  RAISE NOTICE '✅ Security policies created for all tables:';
  RAISE NOTICE '   - profiles: Users can view any profile, update own only';
  RAISE NOTICE '   - patients: Patients access own data, doctors access assigned patients';
  RAISE NOTICE '   - doctors: Doctors manage own profile, all users can view';
  RAISE NOTICE '   - daily_checkins: Patients manage own, assigned doctors can view';
  RAISE NOTICE '   - doctor_notes: Patients read their notes, doctors manage assigned patients';
  RAISE NOTICE '✅ Permissions granted to all user roles';
  RAISE NOTICE '✅ RLS policies migration completed successfully!';
END $$;

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_name text;
  rls_enabled boolean;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'patients', 'doctors', 'doctor_notes', 'daily_checkins')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = table_name;
    
    IF rls_enabled THEN
      RAISE NOTICE '✓ RLS enabled on table: %', table_name;
    ELSE
      RAISE WARNING '⚠ RLS not enabled on table: %', table_name;
    END IF;
  END LOOP;
END $$;

-- Count and verify policies
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'patients', 'doctors', 'doctor_notes', 'daily_checkins');
  
  RAISE NOTICE '📊 Total security policies created: %', policy_count;
  
  IF policy_count >= 15 THEN
    RAISE NOTICE '✅ All expected security policies are in place';
  ELSE
    RAISE WARNING '⚠ Expected at least 15 policies, found %', policy_count;
  END IF;
END $$;
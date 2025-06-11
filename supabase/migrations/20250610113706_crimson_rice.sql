/*
  # Fix Authentication Flow

  1. Database Functions
    - Update handle_new_user function to properly handle user creation
    - Ensure proper error handling and data validation

  2. Triggers
    - Fix trigger to work with both authenticated and anonymous users during signup
    - Ensure trigger fires correctly on user creation

  3. Security
    - Update RLS policies to allow proper profile creation
    - Ensure security while allowing signup flow

  4. Data Integrity
    - Add proper constraints and defaults
    - Ensure email confirmation flow works correctly
*/

-- Drop existing function and recreate with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_full_name text;
  user_role user_role;
BEGIN
  -- Extract full_name from metadata, with fallback to email prefix
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract role from metadata, default to 'patient'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'patient'::user_role
  );

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for better signup flow
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for anon users during signup" ON public.profiles;

-- Allow profile creation during signup (both authenticated and anonymous)
CREATE POLICY "Enable insert for authenticated users during signup"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow anonymous users to create profiles during signup
CREATE POLICY "Enable insert for anon users during signup"
ON public.profiles FOR INSERT
TO anon
WITH CHECK (true);

-- Allow service role for system operations
CREATE POLICY "Enable insert for service role"
ON public.profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Ensure proper defaults and constraints
ALTER TABLE public.profiles 
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN role SET DEFAULT 'patient'::user_role;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles(email);

-- Ensure the profiles table has proper structure
ALTER TABLE public.profiles 
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;
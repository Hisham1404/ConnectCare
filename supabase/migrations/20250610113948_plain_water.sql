/*
  # Fix user signup database error

  1. Database Functions
    - Create or replace `handle_new_user` function to automatically create profiles for new users
    - Function extracts user metadata and creates profile entry

  2. Triggers
    - Create trigger `on_auth_user_created` to call the function after user creation
    - Ensures profile is created automatically when user signs up

  3. Security
    - Function runs with security definer to bypass RLS during profile creation
    - Maintains existing RLS policies for normal operations

  This fixes the "Database error saving new user" issue by ensuring the profiles table
  gets populated automatically when users sign up through Supabase Auth.
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'patient'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table has the correct RLS policy for user creation
-- This policy allows the trigger function to insert profiles
DO $$
BEGIN
  -- Check if the policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Enable insert for service role during signup'
  ) THEN
    CREATE POLICY "Enable insert for service role during signup"
      ON profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Grant necessary permissions to the service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT INSERT ON public.profiles TO service_role;
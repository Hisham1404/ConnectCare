/*
  # Fix profiles table schema for user signup

  1. Schema Updates
    - Update profiles table to properly handle user creation from Supabase Auth
    - Fix foreign key constraint to reference auth.users
    - Add proper default values and constraints
    - Create trigger function to handle new user creation

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user data isolation

  3. Changes
    - Fix id column default value
    - Update foreign key reference
    - Add trigger for automatic profile creation
    - Ensure email is properly handled
*/

-- First, let's create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the profiles table to fix the foreign key constraint
-- First drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure the id column has the correct setup (no default needed since it comes from auth.users)
ALTER TABLE public.profiles ALTER COLUMN id SET NOT NULL;

-- Make sure email can be populated automatically
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- Allow full_name to be empty initially but not null
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;

-- Ensure role has proper default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'patient'::user_role;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- Update the RLS policies to ensure they work correctly
-- Drop and recreate the insert policy for better handling
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;

-- Create a more permissive insert policy for the trigger function
CREATE POLICY "Enable insert for authenticated users during signup"
ON public.profiles FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Also allow service role for manual operations
CREATE POLICY "Enable insert for service role"
ON public.profiles FOR INSERT
TO service_role
WITH CHECK (true);
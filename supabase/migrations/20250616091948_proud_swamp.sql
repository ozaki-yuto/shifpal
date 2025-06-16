/*
  # Fix user signup and authentication policies

  1. Policy Updates
    - Update the INSERT policy for users table to allow proper user registration
    - Ensure users can be created during the signup process
    - Fix the policy that was preventing new user creation

  2. Security
    - Maintain RLS security while allowing proper user registration
    - Users can only insert their own profile data
    - Existing read and update policies remain secure
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert during registration" ON users;

-- Create a new INSERT policy that allows users to create their own profile
-- This policy allows authenticated users to insert a record where the id matches their auth.uid()
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the users table has proper constraints and defaults
-- Add a constraint to ensure role is valid if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text]));
  END IF;
END $$;

-- Ensure email uniqueness constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;
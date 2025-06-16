/*
  # Update authentication policies

  1. Security Updates
    - Update RLS policies to work with Supabase Auth
    - Add proper user authentication checks
    - Ensure data security and access control

  2. Changes
    - Update all policies to use auth.uid() properly
    - Add INSERT policies for user registration
    - Ensure proper role-based access control
*/

-- Drop existing policies and recreate with proper auth
DROP POLICY IF EXISTS "Users can read all user data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Users table policies
CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert during registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update shift requirements policies
DROP POLICY IF EXISTS "Only admins can modify shift requirements" ON shift_requirements;

CREATE POLICY "Only admins can modify shift requirements"
  ON shift_requirements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update shift preferences policies
DROP POLICY IF EXISTS "Staff can manage own preferences" ON shift_preferences;
DROP POLICY IF EXISTS "Admins can manage all preferences" ON shift_preferences;

CREATE POLICY "Staff can manage own preferences"
  ON shift_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = staff_id);

CREATE POLICY "Admins can manage all preferences"
  ON shift_preferences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update shift assignments policies
DROP POLICY IF EXISTS "Staff can update own assignments" ON shift_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON shift_assignments;

CREATE POLICY "Staff can update own assignments"
  ON shift_assignments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = staff_id);

CREATE POLICY "Admins can manage all assignments"
  ON shift_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add sample users with proper UUIDs for testing
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'tanaka@store.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
), (
  '22222222-2222-2222-2222-222222222222',
  'sato@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;
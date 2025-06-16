/*
  # シフト管理システム データベーススキーマ

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text) - 'admin' or 'staff'
      - `created_at` (timestamp)
    - `shift_requirements`
      - `id` (uuid, primary key)
      - `day_of_week` (text)
      - `time_slot` (text)
      - `required_staff` (integer)
      - `created_at` (timestamp)
    - `shift_preferences`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key)
      - `day_of_week` (text)
      - `time_slot` (text)
      - `weekday_desired_hours` (integer)
      - `weekend_desired_hours` (integer)
      - `created_at` (timestamp)
    - `shift_assignments`
      - `id` (uuid, primary key)
      - `staff_id` (uuid, foreign key)
      - `date` (date)
      - `day_of_week` (text)
      - `time_slot` (text)
      - `status` (text) - 'confirmed', 'absent', 'exchange-requested'
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `from_user` (text)
      - `to_user` (text)
      - `title` (text)
      - `content` (text)
      - `type` (text) - 'announcement', 'absence', 'exchange'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Shift requirements table
CREATE TABLE IF NOT EXISTS shift_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  required_staff integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week, time_slot)
);

ALTER TABLE shift_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shift requirements"
  ON shift_requirements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify shift requirements"
  ON shift_requirements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Shift preferences table
CREATE TABLE IF NOT EXISTS shift_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  weekday_desired_hours integer NOT NULL DEFAULT 0,
  weekend_desired_hours integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, day_of_week, time_slot)
);

ALTER TABLE shift_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all shift preferences"
  ON shift_preferences
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage own preferences"
  ON shift_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = staff_id::text);

CREATE POLICY "Admins can manage all preferences"
  ON shift_preferences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Shift assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'absent', 'exchange-requested')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all shift assignments"
  ON shift_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can update own assignments"
  ON shift_assignments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = staff_id::text);

CREATE POLICY "Admins can manage all assignments"
  ON shift_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user text NOT NULL,
  to_user text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('announcement', 'absence', 'exchange')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample data
INSERT INTO users (id, name, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '田中店長', 'tanaka@store.com', 'admin'),
  ('22222222-2222-2222-2222-222222222222', '佐藤花子', 'sato@example.com', 'staff'),
  ('33333333-3333-3333-3333-333333333333', '鈴木太郎', 'suzuki@example.com', 'staff'),
  ('44444444-4444-4444-4444-444444444444', '高橋美咲', 'takahashi@example.com', 'staff'),
  ('55555555-5555-5555-5555-555555555555', '伊藤健太', 'ito@example.com', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Insert sample shift requirements
INSERT INTO shift_requirements (day_of_week, time_slot, required_staff) VALUES
  ('monday', 'morning', 2),
  ('monday', 'afternoon', 3),
  ('monday', 'evening', 2),
  ('tuesday', 'morning', 2),
  ('tuesday', 'afternoon', 3),
  ('tuesday', 'evening', 2),
  ('wednesday', 'morning', 2),
  ('wednesday', 'afternoon', 3),
  ('wednesday', 'evening', 2),
  ('thursday', 'morning', 2),
  ('thursday', 'afternoon', 3),
  ('thursday', 'evening', 2),
  ('friday', 'morning', 2),
  ('friday', 'afternoon', 4),
  ('friday', 'evening', 3),
  ('saturday', 'morning', 3),
  ('saturday', 'afternoon', 4),
  ('saturday', 'evening', 3),
  ('sunday', 'morning', 3),
  ('sunday', 'afternoon', 4),
  ('sunday', 'evening', 2)
ON CONFLICT (day_of_week, time_slot) DO NOTHING;
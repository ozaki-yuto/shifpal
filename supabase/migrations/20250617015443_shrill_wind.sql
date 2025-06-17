/*
  # Create demo users for authentication testing

  1. Demo Users
    - Admin: tanaka@store.com / password123
    - Staff: sato@example.com / password123

  2. Changes
    - Insert demo users into public.users table only
    - Auth users should be created via the application signup process
    - This provides the user profiles that will be linked when auth users are created

  3. Notes
    - The actual authentication records will be created when users sign up
    - These records provide the user profile data
    - Use fixed UUIDs for consistent testing
*/

-- Insert demo users into public.users table
-- These will be linked to auth users when they sign up with matching emails

-- Demo Admin User
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '田中太郎',
  'tanaka@store.com',
  'admin',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  id = EXCLUDED.id;

-- Demo Staff User
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '佐藤花子',
  'sato@example.com',
  'staff',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  id = EXCLUDED.id;

-- Add some sample shift preferences for the demo staff user
INSERT INTO shift_preferences (staff_id, day_of_week, time_slot, weekday_desired_hours, weekend_desired_hours) VALUES
  ('22222222-2222-2222-2222-222222222222', 'monday', 'morning', 4, 6),
  ('22222222-2222-2222-2222-222222222222', 'tuesday', 'afternoon', 4, 6),
  ('22222222-2222-2222-2222-222222222222', 'wednesday', 'evening', 4, 6),
  ('22222222-2222-2222-2222-222222222222', 'saturday', 'morning', 4, 6),
  ('22222222-2222-2222-2222-222222222222', 'sunday', 'afternoon', 4, 6)
ON CONFLICT (staff_id, day_of_week, time_slot) DO NOTHING;

-- Add a sample message
INSERT INTO messages (from_user, to_user, title, content, type) VALUES
  ('田中太郎', 'all', 'システム導入のお知らせ', 'シフパルシステムの運用を開始しました。シフト希望の提出をお願いします。', 'announcement');
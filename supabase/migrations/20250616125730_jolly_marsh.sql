/*
  # Add demo users for testing

  1. Demo Users
    - Admin: tanaka@store.com / password123
    - Staff: sato@example.com / password123

  2. Changes
    - Insert demo users into public.users table
    - These users can be created via Supabase Auth UI or API
*/

-- Insert demo users into public.users table
-- Note: The auth users will need to be created separately via Supabase Auth

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
  role = EXCLUDED.role;

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
  role = EXCLUDED.role;

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
  ('田中太郎', 'all', 'システム導入のお知らせ', 'シフパルシステムの運用を開始しました。シフト希望の提出をお願いします。', 'announcement')
ON CONFLICT DO NOTHING;
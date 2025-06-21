/*
  # Add Demo Users

  1. New Data
    - Add demo admin user (tanaka@store.com)
    - Add demo staff user (sato@example.com)
  
  2. Security
    - Users will be added to Supabase Auth via the application
    - This migration only ensures the user profiles exist in the users table
  
  3. Notes
    - Demo passwords are 'password123' for both accounts
    - These accounts are for demonstration purposes only
*/

-- Insert demo users into the users table
-- Note: The actual auth users need to be created via Supabase Auth API
INSERT INTO users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '田中太郎', 'tanaka@store.com', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', '佐藤花子', 'sato@example.com', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Add some sample shift requirements
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
  ('sunday', 'morning', 2),
  ('sunday', 'afternoon', 3),
  ('sunday', 'evening', 2)
ON CONFLICT (day_of_week, time_slot) DO NOTHING;

-- Add sample shift preferences for the staff user
INSERT INTO shift_preferences (staff_id, day_of_week, time_slot, weekday_desired_hours, weekend_desired_hours) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'monday', 'morning', 8, 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'tuesday', 'afternoon', 8, 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'wednesday', 'evening', 8, 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'saturday', 'morning', 0, 8),
  ('550e8400-e29b-41d4-a716-446655440002', 'sunday', 'afternoon', 0, 8)
ON CONFLICT (staff_id, day_of_week, time_slot) DO NOTHING;
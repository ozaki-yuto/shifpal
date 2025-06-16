/*
  # Create demo users for testing

  1. New Data
    - Demo admin user: tanaka@store.com
    - Demo staff user: sato@example.com
  
  2. Security
    - Users will be added to the users table
    - These are for demonstration purposes only
  
  3. Notes
    - Password hashes are generated for 'password123'
    - These accounts can be used for testing the application
*/

-- Insert demo users into the users table
-- Note: These users will need to be created in Supabase Auth as well
INSERT INTO users (id, name, email, role) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '田中太郎', 'tanaka@store.com', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', '佐藤花子', 'sato@example.com', 'staff')
ON CONFLICT (email) DO NOTHING;
/*
  # Add Demo Users

  1. New Data
    - Creates demo admin user (tanaka@store.com)
    - Creates demo staff user (sato@example.com)
    - Both users will have password 'password123'
  
  2. Security
    - Users will be added to both auth.users and public.users tables
    - Proper role assignments (admin/staff)
  
  Note: This migration adds demo users for testing purposes.
  In production, remove or modify these accounts for security.
*/

-- Insert demo users into auth.users table
-- Note: In Supabase, we need to use the auth admin functions or SQL to create users
-- The passwords will be hashed automatically

-- Demo Admin User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tanaka@store.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Demo Staff User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'sato@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Insert corresponding records into public.users table
-- Admin user profile
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  created_at
) 
SELECT 
  au.id,
  '田中太郎',
  'tanaka@store.com',
  'admin',
  NOW()
FROM auth.users au 
WHERE au.email = 'tanaka@store.com'
ON CONFLICT (email) DO NOTHING;

-- Staff user profile  
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  created_at
)
SELECT 
  au.id,
  '佐藤花子',
  'sato@example.com',
  'staff',
  NOW()
FROM auth.users au 
WHERE au.email = 'sato@example.com'
ON CONFLICT (email) DO NOTHING;
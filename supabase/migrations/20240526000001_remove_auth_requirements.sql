-- This migration removes the requirement for authentication
-- by making all tables accessible without authentication

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Public access" ON users;

-- Create new public access policy for users table
CREATE POLICY "Public access"
ON users FOR SELECT
USING (true);

-- Users table is already included in realtime publication

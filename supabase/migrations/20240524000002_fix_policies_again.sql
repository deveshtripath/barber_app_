-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Barber availability is viewable by everyone" ON barber_availability;

-- Create the policy again
CREATE POLICY "Barber availability is viewable by everyone" 
  ON barber_availability FOR SELECT USING (true);

-- Add admin user if not exists
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@cutqueue.com', '$2a$10$Xt9Hn8QpZJC8dJUip0yo5OmrVXAYBZ6D.bgKvLlP1zMZn5H7uMBhK', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add admin profile if not exists
INSERT INTO public.users (id, name, email, role, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Admin', 'admin@cutqueue.com', 'admin', now(), now())
ON CONFLICT (id) DO NOTHING;

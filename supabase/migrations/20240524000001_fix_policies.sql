-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Customers can create appointments" ON appointments;

-- Create the policy again
CREATE POLICY "Customers can create appointments" 
  ON appointments FOR INSERT WITH CHECK (
    auth.uid() = customer_id
  );

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

-- Add barber availability table
CREATE TABLE IF NOT EXISTS barber_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES users(id),
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_day CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT valid_time CHECK (start_time < end_time)
);

-- Add RLS policies for barber_availability
ALTER TABLE barber_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barber availability is viewable by everyone" 
  ON barber_availability FOR SELECT USING (true);

CREATE POLICY "Barbers can update their own availability" 
  ON barber_availability FOR ALL USING (auth.uid() = barber_id);

-- Add realtime for barber_availability
ALTER PUBLICATION supabase_realtime ADD TABLE barber_availability;

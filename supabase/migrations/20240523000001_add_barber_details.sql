-- Add barber details table to store additional barber information
CREATE TABLE IF NOT EXISTS barber_details (
  id UUID PRIMARY KEY REFERENCES users(id),
  specialty TEXT,
  experience INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 4.5,
  location TEXT,
  availability_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  barber_id UUID NOT NULL REFERENCES users(id),
  service_type TEXT NOT NULL,
  appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Add RLS policies
ALTER TABLE barber_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Barber details policies
CREATE POLICY "Barber details are viewable by everyone" 
  ON barber_details FOR SELECT USING (true);

CREATE POLICY "Barbers can update their own details" 
  ON barber_details FOR UPDATE USING (auth.uid() = id);

-- Appointment policies
CREATE POLICY "Appointments are viewable by the customer or barber involved" 
  ON appointments FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = barber_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Customers can create appointments" 
  ON appointments FOR INSERT WITH CHECK (
    auth.uid() = customer_id
  );

CREATE POLICY "Users can update their own appointments" 
  ON appointments FOR UPDATE USING (
    auth.uid() = customer_id OR 
    auth.uid() = barber_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE barber_details;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

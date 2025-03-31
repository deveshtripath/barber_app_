-- First update existing NULL or empty values to a default placeholder value
UPDATE users SET phone = '+0000000000' WHERE phone IS NULL OR phone = '';

-- Then add the NOT NULL constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- Add a check constraint to ensure phone is not empty
ALTER TABLE users ADD CONSTRAINT phone_not_empty CHECK (phone <> '');

-- Enable realtime for users table if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE users;

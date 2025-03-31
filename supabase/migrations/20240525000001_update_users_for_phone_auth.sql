-- Update users table to make phone required and email optional
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add index on phone for faster lookups
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- Add unique constraint on phone
ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);

-- Remove password_hash column as it's no longer needed with OTP auth
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- This migration ensures the password_hash column exists and is properly indexed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;

  -- Create index on email for faster lookups
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_idx') THEN
    CREATE INDEX users_email_idx ON users(email);
  END IF;

  -- Create index on password_hash for faster lookups
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_password_hash_idx') THEN
    CREATE INDEX users_password_hash_idx ON users(password_hash);
  END IF;
END $$;

-- The following line is commented out to prevent errors if the table is already in the publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE users;
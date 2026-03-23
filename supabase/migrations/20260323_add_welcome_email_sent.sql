-- Add welcome_email_sent flag to prevent duplicate welcome emails
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

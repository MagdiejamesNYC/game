/*
  # Update User Progress for Authentication

  1. Changes
    - Drop existing RLS policies first
    - Remove session_id column from user_progress table
    - Make user_id NOT NULL since all users will be authenticated
    - Add unique constraint on user_id to ensure one progress record per user
    
  2. Security
    - Create new RLS policies using auth.uid() for proper user isolation
*/

-- Drop all existing policies first to remove dependencies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own creatures" ON user_creatures;
DROP POLICY IF EXISTS "Users can insert own creatures" ON user_creatures;

-- Remove session_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE user_progress DROP COLUMN session_id;
  END IF;
END $$;

-- Delete any rows without a user_id and make user_id NOT NULL
DO $$
BEGIN
  DELETE FROM user_progress WHERE user_id IS NULL;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE user_progress ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_progress_user_id_key'
  ) THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create new RLS policies for user_progress
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new RLS policies for user_creatures
CREATE POLICY "Users can read own creatures"
  ON user_creatures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND user_progress.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own creatures"
  ON user_creatures FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND user_progress.user_id = auth.uid()
    )
  );
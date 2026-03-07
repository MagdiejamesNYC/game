/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add index on user_creatures.creature_id foreign key for optimal query performance
    - Optimize RLS policies to use subquery pattern (select auth.uid()) to prevent re-evaluation

  2. Changes
    - Create index idx_user_creatures_creature_id on user_creatures(creature_id)
    - Recreate all RLS policies with optimized auth.uid() checks using subquery pattern

  3. Security
    - Maintains same security posture while improving performance
    - All policies continue to restrict access to authenticated users and their own data
*/

-- Add missing index on creature_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_creatures_creature_id 
  ON user_creatures(creature_id);

-- Drop and recreate user_progress policies with optimized pattern
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate user_creatures policies with optimized pattern
DROP POLICY IF EXISTS "Users can read own creatures" ON user_creatures;
DROP POLICY IF EXISTS "Users can insert own creatures" ON user_creatures;

CREATE POLICY "Users can read own creatures"
  ON user_creatures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND user_progress.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own creatures"
  ON user_creatures FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND user_progress.user_id = (select auth.uid())
    )
  );
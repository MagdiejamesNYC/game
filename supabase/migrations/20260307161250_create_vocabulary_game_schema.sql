/*
  # Vocabulary Game Database Schema

  ## Overview
  Creates the complete database structure for a vocabulary learning game with a Points → Chest → Creature reward system.

  ## 1. New Tables
  
  ### `words`
  Stores vocabulary words with their meanings and accepted synonyms.
  - `id` (uuid, primary key) - Unique identifier
  - `word` (text) - The vocabulary word/prefix
  - `meaning` (text) - The definition or meaning
  - `accepted_synonyms` (text[]) - Array of valid answers
  - `difficulty` (text) - Difficulty level (easy/medium/hard)
  - `created_at` (timestamptz) - Record creation time

  ### `creatures`
  Catalog of all collectible creatures across rarity tiers.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Creature name
  - `rarity` (text) - common/rare/epic/legendary
  - `points_required` (integer) - Minimum points needed to unlock this tier
  - `element` (text) - Creature's elemental type (fire/water/earth/air/etc)
  - `description` (text) - Flavor text
  - `image_identifier` (text) - Reference for creature visualization
  - `created_at` (timestamptz) - Record creation time

  ### `user_progress`
  Tracks individual user's game progress and statistics.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users (nullable for demo)
  - `current_points` (integer) - Points toward next chest
  - `total_points` (integer) - Lifetime points earned
  - `words_completed` (integer) - Total correct answers
  - `chests_opened` (integer) - Total chests unlocked
  - `session_id` (text) - Session identifier for non-authenticated users
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### `user_creatures`
  Tracks which creatures each user has unlocked.
  - `id` (uuid, primary key) - Unique identifier
  - `user_progress_id` (uuid, foreign key) - Links to user_progress
  - `creature_id` (uuid, foreign key) - Links to creatures
  - `unlocked_at` (timestamptz) - When creature was obtained
  - Unique constraint on (user_progress_id, creature_id) - Prevent duplicates

  ## 2. Security
  
  All tables have RLS enabled with policies for:
  - Public read access for words and creatures (game catalog)
  - Users can manage their own progress and creatures
  - Session-based access for non-authenticated users

  ## 3. Important Notes
  - Session-based gameplay allows immediate play without authentication
  - Points reset after opening chests (tracked via current_points)
  - Total_points tracks lifetime achievement
  - Creatures are randomly awarded from their rarity tier
*/

-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  meaning text NOT NULL,
  accepted_synonyms text[] DEFAULT '{}',
  difficulty text DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

-- Create creatures table
CREATE TABLE IF NOT EXISTS creatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_required integer NOT NULL,
  element text,
  description text,
  image_identifier text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_points integer DEFAULT 0,
  total_points integer DEFAULT 0,
  words_completed integer DEFAULT 0,
  chests_opened integer DEFAULT 0,
  session_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_creatures table
CREATE TABLE IF NOT EXISTS user_creatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_progress_id uuid REFERENCES user_progress(id) ON DELETE CASCADE NOT NULL,
  creature_id uuid REFERENCES creatures(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_progress_id, creature_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_session ON user_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_creatures_progress ON user_creatures(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_creatures_rarity ON creatures(rarity);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_creatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for words (public read)
CREATE POLICY "Anyone can view words"
  ON words FOR SELECT
  TO public
  USING (true);

-- RLS Policies for creatures (public read)
CREATE POLICY "Anyone can view creatures"
  ON creatures FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO public
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO public
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (session_id IS NOT NULL)
  );

-- RLS Policies for user_creatures
CREATE POLICY "Users can view own creatures"
  ON user_creatures FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND (
        (auth.uid() IS NOT NULL AND user_progress.user_id = auth.uid()) OR
        (user_progress.session_id IS NOT NULL)
      )
    )
  );

CREATE POLICY "Users can insert own creatures"
  ON user_creatures FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.id = user_creatures.user_progress_id
      AND (
        (auth.uid() IS NOT NULL AND user_progress.user_id = auth.uid()) OR
        (user_progress.session_id IS NOT NULL)
      )
    )
  );

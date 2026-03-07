export interface Word {
  id: string;
  word: string;
  meaning: string;
  accepted_synonyms: string[];
  difficulty: string;
}

export interface Creature {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_required: number;
  element: string;
  description: string;
  image_identifier: string;
}

export interface UserProgress {
  id: string;
  user_id: string | null;
  current_points: number;
  total_points: number;
  words_completed: number;
  chests_opened: number;
  session_id: string;
}

export interface UserCreature {
  id: string;
  user_progress_id: string;
  creature_id: string;
  unlocked_at: string;
  creature?: Creature;
}

export type ChestType = 'standard' | 'rare' | 'epic' | 'legendary';

export interface ChestRequirement {
  type: ChestType;
  points: number;
  rarity: Creature['rarity'];
}

export const CHEST_REQUIREMENTS: ChestRequirement[] = [
  { type: 'standard', points: 50, rarity: 'common' },
  { type: 'rare', points: 150, rarity: 'rare' },
  { type: 'epic', points: 350, rarity: 'epic' },
  { type: 'legendary', points: 750, rarity: 'legendary' },
];

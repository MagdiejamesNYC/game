import { supabase } from '../lib/supabase';
import type { Word, Creature, UserProgress, UserCreature, ChestRequirement } from '../types/game';
import { CHEST_REQUIREMENTS } from '../types/game';

export class GameService {
  static async signUp(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');
  }

  static async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getOrCreateUserProgress(): Promise<UserProgress> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return data;
    }

    const { data: newProgress, error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        current_points: 0,
        total_points: 0,
        words_completed: 0,
        chests_opened: 0,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProgress;
  }

  static async getRandomWord(): Promise<Word> {
    const { data, error } = await supabase
      .from('words')
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No words found');

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  static validateAnswer(word: Word, answer: string): boolean {
    const normalizedAnswer = answer.toLowerCase().trim();
    return word.accepted_synonyms.some(
      synonym => synonym.toLowerCase() === normalizedAnswer
    );
  }

  static async addPoints(progressId: string, points: number, incrementWords: boolean = true): Promise<UserProgress> {
    const { data: current } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', progressId)
      .single();

    if (!current) throw new Error('Progress not found');

    const newCurrentPoints = Math.max(0, current.current_points + points);
    const newTotalPoints = points > 0 ? current.total_points + points : current.total_points;

    const updateData: any = {
      current_points: newCurrentPoints,
      total_points: newTotalPoints,
      updated_at: new Date().toISOString(),
    };

    if (incrementWords) {
      updateData.words_completed = current.words_completed + 1;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .update(updateData)
      .eq('id', progressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static getNextChest(currentPoints: number): ChestRequirement | null {
    const affordable = CHEST_REQUIREMENTS.filter(req => currentPoints >= req.points);
    if (affordable.length === 0) return null;
    return affordable.reduce((highest, current) =>
      current.points > highest.points ? current : highest
    );
  }

  static getAffordableChests(currentPoints: number): ChestRequirement[] {
    return CHEST_REQUIREMENTS.filter(req => currentPoints >= req.points)
      .sort((a, b) => b.points - a.points);
  }

  static async unlockChest(progressId: string, chestType: ChestRequirement): Promise<Creature> {
    const { data: current } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', progressId)
      .single();

    if (!current) throw new Error('Progress not found');

    const creature = await this.getRandomCreatureByRarity(chestType.rarity);

    await supabase
      .from('user_creatures')
      .insert({
        user_progress_id: progressId,
        creature_id: creature.id,
      });

    await supabase
      .from('user_progress')
      .update({
        current_points: current.current_points - chestType.points,
        chests_opened: current.chests_opened + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', progressId);

    return creature;
  }

  static async getRandomCreatureByRarity(rarity: string): Promise<Creature> {
    const { data, error } = await supabase
      .from('creatures')
      .select('*')
      .eq('rarity', rarity);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error(`No creatures found for rarity: ${rarity}`);

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  static async getUserCreatures(progressId: string): Promise<UserCreature[]> {
    const { data, error } = await supabase
      .from('user_creatures')
      .select(`
        *,
        creature:creatures(*)
      `)
      .eq('user_progress_id', progressId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllCreatures(): Promise<Creature[]> {
    const { data, error } = await supabase
      .from('creatures')
      .select('*')
      .order('points_required', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

import { Flame, Droplet, Mountain, Wind, Zap, Snowflake, Moon, Sun, Leaf, Sparkles } from 'lucide-react';
import type { Creature } from '../types/game';

interface CreatureCardProps {
  creature: Creature | null;
  locked?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const elementIcons: Record<string, typeof Flame> = {
  fire: Flame,
  water: Droplet,
  earth: Mountain,
  air: Wind,
  electric: Zap,
  ice: Snowflake,
  dark: Moon,
  light: Sun,
  nature: Leaf,
  time: Sparkles,
  cosmic: Sparkles,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600',
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400',
};

const sizeClasses = {
  small: 'w-24 h-32',
  medium: 'w-32 h-40',
  large: 'w-48 h-64',
};

export function CreatureCard({ creature, locked = false, size = 'medium' }: CreatureCardProps) {
  if (locked || !creature) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center`}>
        <div className="text-gray-600 text-4xl">?</div>
      </div>
    );
  }

  const Icon = elementIcons[creature.element] || Sparkles;

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br ${rarityColors[creature.rarity]} rounded-lg border-4 ${rarityBorders[creature.rarity]} p-3 flex flex-col items-center justify-between shadow-lg hover:scale-105 transition-transform`}>
      <div className="flex-1 flex items-center justify-center">
        <Icon className="w-16 h-16 text-white" />
      </div>
      <div className="text-center">
        <h3 className="text-white font-bold text-sm mb-1">{creature.name}</h3>
        <p className="text-white text-xs opacity-90 capitalize">{creature.rarity}</p>
      </div>
    </div>
  );
}

import { Sparkles } from 'lucide-react';
import type { Creature } from '../types/game';
import { CreatureCard } from './CreatureCard';

interface CreatureRevealProps {
  creature: Creature;
  onContinue: () => void;
}

const rarityMessages = {
  common: 'A new companion joins you!',
  rare: 'An impressive ally appears!',
  epic: 'A powerful guardian emerges!',
  legendary: 'A LEGENDARY being has chosen you!',
};

export function CreatureReveal({ creature, onContinue }: CreatureRevealProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
          <h2 className="text-3xl font-bold mx-4">{rarityMessages[creature.rarity]}</h2>
          <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>

        <div className="flex justify-center mb-6 animate-scaleIn">
          <CreatureCard creature={creature} size="large" />
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">{creature.name}</h3>
          <p className="text-gray-600 mb-2">{creature.description}</p>
          <p className="text-sm text-gray-500 capitalize">Element: {creature.element}</p>
        </div>

        <button
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}

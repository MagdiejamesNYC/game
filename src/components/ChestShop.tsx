import { Gift, Lock } from 'lucide-react';
import type { ChestRequirement } from '../types/game';
import { CHEST_REQUIREMENTS } from '../types/game';

interface ChestShopProps {
  currentPoints: number;
  onSelectChest: (chest: ChestRequirement) => void;
  onClose: () => void;
}

const chestColors = {
  standard: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600',
};

const chestBorders = {
  standard: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400',
};

const chestNames = {
  standard: 'Common Chest',
  rare: 'Rare Chest',
  epic: 'Epic Chest',
  legendary: 'Legendary Chest',
};

export function ChestShop({ currentPoints, onSelectChest, onClose }: ChestShopProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Chest Shop</h2>
          <p className="text-gray-600 text-lg">
            Your Points: <span className="font-bold text-emerald-600">{currentPoints}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {CHEST_REQUIREMENTS.map((chest) => {
            const canAfford = currentPoints >= chest.points;

            return (
              <div
                key={chest.type}
                className={`relative bg-gradient-to-br ${chestColors[chest.type]} rounded-xl p-6 border-4 ${chestBorders[chest.type]} transition-all ${
                  canAfford ? 'cursor-pointer hover:scale-105 shadow-lg' : 'opacity-50'
                }`}
                onClick={() => canAfford && onSelectChest(chest)}
              >
                {!canAfford && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex flex-col items-center text-white">
                  <Gift className="w-20 h-20 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{chestNames[chest.type]}</h3>
                  <p className="text-3xl font-bold mb-4">{chest.points} Points</p>
                  <p className="text-sm opacity-90 capitalize">Contains: {chest.rarity} Creature</p>

                  {canAfford && (
                    <button className="mt-4 bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Open Now
                    </button>
                  )}

                  {!canAfford && (
                    <p className="mt-4 text-sm">
                      Need {chest.points - currentPoints} more points
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Keep Learning
          </button>
        </div>
      </div>
    </div>
  );
}

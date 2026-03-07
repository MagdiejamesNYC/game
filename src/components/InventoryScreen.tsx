import { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import type { Creature, UserCreature } from '../types/game';
import { CreatureCard } from './CreatureCard';

interface InventoryScreenProps {
  userCreatures: UserCreature[];
  allCreatures: Creature[];
  onClose: () => void;
}

type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary';

export function InventoryScreen({ userCreatures, allCreatures, onClose }: InventoryScreenProps) {
  const [filter, setFilter] = useState<RarityFilter>('all');
  const [displayCreatures, setDisplayCreatures] = useState<Creature[]>([]);

  const unlockedIds = new Set(userCreatures.map(uc => uc.creature_id));

  useEffect(() => {
    let filtered = allCreatures;
    if (filter !== 'all') {
      filtered = allCreatures.filter(c => c.rarity === filter);
    }
    setDisplayCreatures(filtered);
  }, [filter, allCreatures]);

  const stats = {
    total: allCreatures.length,
    unlocked: unlockedIds.size,
    common: userCreatures.filter(uc => uc.creature?.rarity === 'common').length,
    rare: userCreatures.filter(uc => uc.creature?.rarity === 'rare').length,
    epic: userCreatures.filter(uc => uc.creature?.rarity === 'epic').length,
    legendary: userCreatures.filter(uc => uc.creature?.rarity === 'legendary').length,
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-amber-500" />
                Creature Collection
              </h1>
              <p className="text-gray-300 text-lg">
                {stats.unlocked} / {stats.total} Collected
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{stats.common}</div>
                <div className="text-sm text-gray-500">Common</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.rare}</div>
                <div className="text-sm text-blue-500">Rare</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.epic}</div>
                <div className="text-sm text-purple-500">Epic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{stats.legendary}</div>
                <div className="text-sm text-amber-500">Legendary</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.unlocked}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('common')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'common'
                  ? 'bg-gray-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Common
            </button>
            <button
              onClick={() => setFilter('rare')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'rare'
                  ? 'bg-blue-400 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Rare
            </button>
            <button
              onClick={() => setFilter('epic')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'epic'
                  ? 'bg-purple-400 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Epic
            </button>
            <button
              onClick={() => setFilter('legendary')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'legendary'
                  ? 'bg-amber-400 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Legendary
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayCreatures.map((creature) => (
              <div key={creature.id} className="relative group">
                <CreatureCard
                  creature={unlockedIds.has(creature.id) ? creature : null}
                  locked={!unlockedIds.has(creature.id)}
                  size="medium"
                />
                {unlockedIds.has(creature.id) && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all rounded-lg flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {creature.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Package } from 'lucide-react';
import type { ChestType } from '../types/game';

interface ChestAnimationProps {
  chestType: ChestType;
  onOpen: () => void;
}

const chestColors = {
  standard: 'from-gray-400 to-gray-700',
  rare: 'from-blue-400 to-blue-700',
  epic: 'from-purple-400 to-purple-700',
  legendary: 'from-amber-400 to-amber-700',
};

export function ChestAnimation({ chestType, onOpen }: ChestAnimationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-scaleIn">
        <h2 className="text-3xl font-bold mb-6 capitalize">{chestType} Chest Unlocked!</h2>

        <div className={`w-48 h-48 mx-auto mb-6 bg-gradient-to-br ${chestColors[chestType]} rounded-2xl flex items-center justify-center shadow-2xl animate-bounce`}>
          <Package className="w-32 h-32 text-white" />
        </div>

        <button
          onClick={onOpen}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Open Chest
        </button>
      </div>
    </div>
  );
}

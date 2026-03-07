import type { ChestRequirement } from '../types/game';

interface ProgressBarProps {
  currentPoints: number;
  nextChest: ChestRequirement | null;
}

export function ProgressBar({ currentPoints, nextChest }: ProgressBarProps) {
  if (!nextChest) {
    const legendaryPoints = 1000;
    const progress = Math.min((currentPoints / legendaryPoints) * 100, 100);

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Points: {currentPoints}</span>
          <span className="text-sm font-medium text-amber-600">Legendary Chest at 1000</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  const progress = Math.min((currentPoints / nextChest.points) * 100, 100);

  const chestColors = {
    standard: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
  };

  const textColors = {
    standard: 'text-gray-700',
    rare: 'text-blue-700',
    epic: 'text-purple-700',
    legendary: 'text-amber-700',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Points: {currentPoints} / {nextChest.points}
        </span>
        <span className={`text-sm font-bold capitalize ${textColors[nextChest.type]}`}>
          {nextChest.type} Chest
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${chestColors[nextChest.type]} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Package, CheckCircle, XCircle, Gift, LogOut, User } from 'lucide-react';
import type { Word, UserProgress, Creature, ChestRequirement } from '../types/game';
import { GameService } from '../services/gameService';
import { ChestShop } from './ChestShop';
import { ChestAnimation } from './ChestAnimation';
import { CreatureReveal } from './CreatureReveal';

interface GameScreenProps {
  progress: UserProgress;
  onProgressUpdate: (progress: UserProgress) => void;
  onOpenInventory: () => void;
  onLogout: () => void;
  userEmail: string;
}

type GameState = 'playing' | 'correct' | 'incorrect' | 'chest_shop' | 'chest_opening' | 'creature_reveal';

export function GameScreen({ progress, onProgressUpdate, onOpenInventory, onLogout, userEmail }: GameScreenProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [selectedChest, setSelectedChest] = useState<ChestRequirement | null>(null);
  const [unlockedCreature, setUnlockedCreature] = useState<Creature | null>(null);
  const [affordableChests, setAffordableChests] = useState<ChestRequirement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNewWord();
  }, []);

  useEffect(() => {
    const affordable = GameService.getAffordableChests(progress.current_points);
    setAffordableChests(affordable);
  }, [progress.current_points]);

  const loadNewWord = async () => {
    try {
      const word = await GameService.getRandomWord();
      setCurrentWord(word);
      setGameState('playing');
      setAnswer('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to load word:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !answer.trim()) return;

    const isCorrect = GameService.validateAnswer(currentWord, answer);

    if (isCorrect) {
      setGameState('correct');

      try {
        const updatedProgress = await GameService.addPoints(progress.id, 10);
        onProgressUpdate(updatedProgress);

        setTimeout(() => {
          loadNewWord();
        }, 1500);
      } catch (error) {
        console.error('Failed to add points:', error);
        setTimeout(() => {
          loadNewWord();
        }, 1500);
      }
    } else {
      setGameState('incorrect');

      try {
        const updatedProgress = await GameService.addPoints(progress.id, -10, false);
        onProgressUpdate(updatedProgress);
      } catch (error) {
        console.error('Failed to deduct points:', error);
      }

      setTimeout(() => {
        setGameState('playing');
        setAnswer('');
        inputRef.current?.focus();
      }, 1500);
    }
  };

  const handleOpenChestShop = () => {
    setGameState('chest_shop');
  };

  const handleSelectChest = (chest: ChestRequirement) => {
    setSelectedChest(chest);
    setGameState('chest_opening');
    handleOpenChest(chest);
  };

  const handleOpenChest = async (chest: ChestRequirement) => {
    try {
      const creature = await GameService.unlockChest(progress.id, chest);
      const updatedProgress = await GameService.getOrCreateUserProgress();
      onProgressUpdate(updatedProgress);

      setTimeout(() => {
        setUnlockedCreature(creature);
        setGameState('creature_reveal');
      }, 500);
    } catch (error) {
      console.error('Failed to unlock chest:', error);
      setGameState('playing');
      loadNewWord();
    }
  };

  const handleContinue = () => {
    setUnlockedCreature(null);
    setSelectedChest(null);
    loadNewWord();
  };

  const handleCloseShop = () => {
    setGameState('playing');
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col">
      <header className="bg-slate-900 shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Vocabulary Quest</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm">{userEmail}</span>
            </div>
            <button
              onClick={handleOpenChestShop}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors relative"
              disabled={affordableChests.length === 0}
            >
              <Gift className="w-5 h-5" />
              Open Chest
              {affordableChests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {affordableChests.length}
                </span>
              )}
            </button>
            <button
              onClick={onOpenInventory}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Package className="w-5 h-5" />
              Collection
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-90">Your Points</div>
                  <div className="text-4xl font-bold">{progress.current_points}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Next Chest</div>
                  <div className="text-2xl font-bold">
                    {affordableChests.length > 0 ? 'Available!' : '50 pts'}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-gray-600 text-lg mb-4">What does this prefix mean?</h2>
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl p-8 mb-4">
                <p className="text-5xl font-bold">{currentWord.word}</p>
              </div>
              <p className="text-gray-500 text-sm">Type a synonym and press Enter</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={gameState !== 'playing'}
                  placeholder="Your answer..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
                {gameState === 'correct' && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-8 h-8 text-green-500 animate-scaleIn" />
                  </div>
                )}
                {gameState === 'incorrect' && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <XCircle className="w-8 h-8 text-red-500 animate-shake" />
                  </div>
                )}
              </div>

              {gameState === 'incorrect' && (
                <div className="text-center animate-fadeIn space-y-1">
                  <p className="text-red-500 font-semibold">-10 points</p>
                  <p className="text-gray-600">Try again! Hint: {currentWord.meaning}</p>
                </div>
              )}

              {gameState === 'correct' && (
                <p className="text-green-600 text-center font-semibold animate-fadeIn">
                  Correct! +10 points
                </p>
              )}
            </form>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{progress.words_completed}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{progress.total_points}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{progress.chests_opened}</div>
                <div className="text-sm text-gray-600">Chests</div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>Earn points to unlock chests and collect creatures!</p>
          </div>
        </div>
      </main>

      {gameState === 'chest_shop' && (
        <ChestShop
          currentPoints={progress.current_points}
          onSelectChest={handleSelectChest}
          onClose={handleCloseShop}
        />
      )}

      {gameState === 'chest_opening' && selectedChest && (
        <ChestAnimation chestType={selectedChest.type} onOpen={() => {}} />
      )}

      {gameState === 'creature_reveal' && unlockedCreature && (
        <CreatureReveal creature={unlockedCreature} onContinue={handleContinue} />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { UserProgress, UserCreature, Creature } from './types/game';
import { GameService } from './services/gameService';
import { GameScreen } from './components/GameScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './lib/supabase';

type AppState = 'loading' | 'auth' | 'game' | 'inventory';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [userCreatures, setUserCreatures] = useState<UserCreature[]>([]);
  const [allCreatures, setAllCreatures] = useState<Creature[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
        initializeGame();
      } else {
        setAppState('auth');
        setProgress(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const user = await GameService.getCurrentUser();
    if (user) {
      setUserEmail(user.email || '');
      initializeGame();
    } else {
      setAppState('auth');
    }
  };

  const initializeGame = async () => {
    try {
      const userProgress = await GameService.getOrCreateUserProgress();
      setProgress(userProgress);

      const [creatures, userCr] = await Promise.all([
        GameService.getAllCreatures(),
        GameService.getUserCreatures(userProgress.id),
      ]);

      setAllCreatures(creatures);
      setUserCreatures(userCr);
      setAppState('game');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setAppState('auth');
    }
  };

  const handleProgressUpdate = async (newProgress: UserProgress) => {
    setProgress(newProgress);

    const updatedCreatures = await GameService.getUserCreatures(newProgress.id);
    setUserCreatures(updatedCreatures);
  };

  const handleOpenInventory = async () => {
    if (!progress) return;

    const updatedCreatures = await GameService.getUserCreatures(progress.id);
    setUserCreatures(updatedCreatures);
    setAppState('inventory');
  };

  const handleCloseInventory = () => {
    setAppState('game');
  };

  const handleSignIn = async (email: string, password: string) => {
    await GameService.signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await GameService.signUp(email, password);
  };

  const handleAuthSuccess = () => {
    initializeGame();
  };

  const handleLogout = async () => {
    await GameService.signOut();
    setAppState('auth');
    setProgress(null);
    setUserCreatures([]);
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading your adventure...</div>
      </div>
    );
  }

  if (appState === 'auth') {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    );
  }

  if (appState === 'inventory') {
    return (
      <InventoryScreen
        userCreatures={userCreatures}
        allCreatures={allCreatures}
        onClose={handleCloseInventory}
      />
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading your adventure...</div>
      </div>
    );
  }

  return (
    <GameScreen
      progress={progress}
      onProgressUpdate={handleProgressUpdate}
      onOpenInventory={handleOpenInventory}
      onLogout={handleLogout}
      userEmail={userEmail}
    />
  );
}

export default App;

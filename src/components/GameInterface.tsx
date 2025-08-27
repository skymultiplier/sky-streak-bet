import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plane, TrendingUp, Bomb, DollarSign, Waves, Mountain, Gift, User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MultiplierBox {
  id: number;
  multiplier: number;
  revealed: boolean;
  hit: boolean;
  position: number;
}

export const GameInterface = () => {
  const [betAmount, setBetAmount] = useState("10");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "flying" | "crashed" | "landed" | "collect">("waiting");
  const [planePosition, setPlanePosition] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [multiplierBoxes, setMultiplierBoxes] = useState<MultiplierBox[]>([]);
  const [currentWinnings, setCurrentWinnings] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lossStreak, setLossStreak] = useState(0);
  const [showWinningEffect, setShowWinningEffect] = useState(false);
  const [currentBetId, setCurrentBetId] = useState<string | null>(null);

  const { playBetSound, playWinSound, startBackgroundMusic, stopBackgroundMusic } = useSoundEffects();
  const { user, userProfile, refreshProfile, balance, username, isAuthenticated } = useAuth();

  useEffect(() => {
    // Start background music when component mounts
    startBackgroundMusic();

    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // Generate random multiplier boxes - improved odds for demo mode to be more enticing
  const generateMultiplierBoxes = () => {
    const boxes: MultiplierBox[] = [];
    
    // Calculate streak bonus - more losses = better odds
    const streakBonus = Math.min(lossStreak * 0.05, 0.15); // Max 15% bonus for demo
    const demoBonus = isDemoMode ? 0.1 : 0; // Extra 10% for demo mode to be more enticing
    
    for (let i = 0; i < 6; i++) {
      const rand = Math.random();
      let multiplier;
      
      if (isDemoMode) {
        // Demo mode - more generous odds for better experience
        if (rand < 0.65 - streakBonus - demoBonus) {
          // 65% chance for small wins/break-even (0.8x - 1.4x) - mostly winning in demo
          multiplier = +(Math.random() * 0.6 + 0.8).toFixed(1);
        } else if (rand < 0.85) {
          // 20% chance for good multipliers (1.5x - 2.5x)
          multiplier = +(Math.random() * 1.0 + 1.5).toFixed(1);
        } else if (rand < 0.97) {
          // 12% chance for great multipliers (2.6x - 4x)
          multiplier = +(Math.random() * 1.4 + 2.6).toFixed(1);
        } else {
          // 3% chance for amazing multipliers (4x - 6x) - more common in demo
          const bigMultiplier = 4 + (Math.random() * 2) + (lossStreak * 0.3);
          multiplier = +Math.min(bigMultiplier, 6).toFixed(1);
        }
      } else {
        // Real mode - conservative odds
        if (rand < 0.85 - streakBonus) {
          // 85% chance for losing/very low multipliers (0.5x - 1.2x) - mostly losing
          multiplier = +(Math.random() * 0.7 + 0.5).toFixed(1);
        } else if (rand < 0.95) {
          // 10% chance for small profit multipliers (1.3x - 1.8x)
          multiplier = +(Math.random() * 0.5 + 1.3).toFixed(1);
        } else if (rand < 0.99) {
          // 4% chance for decent multipliers (1.9x - 2.8x)
          multiplier = +(Math.random() * 0.9 + 1.9).toFixed(1);
        } else {
          // 1% chance for big multipliers (3x - 5x) - extremely rare
          const bigMultiplier = 3 + (Math.random() * 2) + (lossStreak * 0.2);
          multiplier = +Math.min(bigMultiplier, 5).toFixed(1);
        }
      }

      boxes.push({
        id: i,
        multiplier,
        revealed: false,
        hit: false,
        position: (i + 1) * (90 / 7) // Distribute along the path
      });
    }
    return boxes;
  };

  // Initialize multiplier boxes when game starts
  useEffect(() => {
    if (gameStatus === "waiting") {
      setMultiplierBoxes(generateMultiplierBoxes());
      setCurrentMultiplier(1.0);
      setCurrentWinnings(parseFloat(betAmount));
    }
  }, [gameStatus, betAmount]);

  // Game animation and multiplier hitting logic
  useEffect(() => {
    if (gameStatus === "flying") {
      const interval = setInterval(() => {
        setPlanePosition(prev => {
          const newPosition = prev + 1.5;
          
          // Check if plane hits any multiplier boxes
          setMultiplierBoxes(prevBoxes => {
            return prevBoxes.map(box => {
              if (!box.hit && newPosition >= box.position - 2 && newPosition <= box.position + 2) {
                // Plane hit this box
                setCurrentMultiplier(prevMult => {
                  const newMult = Math.max(0.1, prevMult * box.multiplier);
                  setCurrentWinnings(parseFloat(betAmount) * newMult);
                  return newMult;
                });
                
                return { ...box, revealed: true, hit: true };
              }
              return box;
            });
          });
          
          if (newPosition >= 90) {
            setGameStatus("collect");
            return 90;
          }
          return newPosition;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameStatus, betAmount]);

  const startGame = async () => {
    const betAmountNum = parseFloat(betAmount);
    
    if (isDemoMode) {
      // Demo mode - use localStorage for now
      startDemoGame();
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (betAmountNum > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to place this bet.",
        variant: "destructive",
      });
      return;
    }
    
    // Play bet sound effect
    playBetSound();
    
    try {
      // Place bet using Supabase
      const { data, error } = await supabase.rpc('place_bet', {
        _game_id: `game_${Date.now()}`,
        _bet_amount: betAmountNum
      });

      if (error) {
        toast({
          title: "Bet Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCurrentBetId(data[0].bet_id);
      setGameStatus("flying");
      setPlanePosition(0);
      setCurrentMultiplier(1.0);
      setCurrentWinnings(betAmountNum);
      
      // Refresh user profile to get updated balance
      await refreshProfile();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startDemoGame = () => {
    // Demo mode logic (same as before)
    const savedBalance = localStorage.getItem('demoBalance') || '1000';
    const currentBalance = parseFloat(savedBalance);
    
    if (parseFloat(betAmount) > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough demo funds to place this bet.",
        variant: "destructive",
      });
      return;
    }

    playBetSound();
    setGameStatus("flying");
    setPlanePosition(0);
    setCurrentMultiplier(1.0);
    setCurrentWinnings(parseFloat(betAmount));
    
    const newBalance = currentBalance - parseFloat(betAmount);
    localStorage.setItem('demoBalance', newBalance.toString());
  };

  const cashOut = () => {
    if (gameStatus === "flying") {
      setGameStatus("collect");
    }
  };

  const collectWinnings = async () => {
    const finalMultiplier = currentMultiplier;
    const isWin = currentWinnings > parseFloat(betAmount);
    
    if (isDemoMode) {
      // Demo mode logic
      collectDemoWinnings(isWin, finalMultiplier);
      return;
    }

    if (!currentBetId) {
      toast({
        title: "Error",
        description: "No active bet found.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Resolve bet using Supabase
      const { data, error } = await supabase.rpc('resolve_bet', {
        _bet_id: currentBetId,
        _multiplier: finalMultiplier
      });

      if (error) {
        console.error('Error resolving bet:', error);
        toast({
          title: "Error",
          description: "Failed to resolve bet.",
          variant: "destructive",
        });
        return;
      }

      // Update loss streak based on win/loss
      if (isWin) {
        setLossStreak(0); // Reset streak on win
        playWinSound();
        // Show winning visual effect
        setShowWinningEffect(true);
        setTimeout(() => setShowWinningEffect(false), 3000);
        
        toast({
          title: "Congratulations!",
          description: `You won $${data[0].payout.toFixed(2)}!`,
        });
      } else {
        setLossStreak(prev => prev + 1); // Increment streak on loss
      }
      
      // Refresh user profile to get updated balance
      await refreshProfile();
      
    } catch (error) {
      console.error('Error resolving bet:', error);
      toast({
        title: "Error",
        description: "Failed to resolve bet.",
        variant: "destructive",
      });
    }
    
    setGameStatus("waiting");
    setPlanePosition(0);
    setCurrentBetId(null);
  };

  const collectDemoWinnings = (isWin: boolean, finalMultiplier: number) => {
    const savedBalance = localStorage.getItem('demoBalance') || '1000';
    let currentBalance = parseFloat(savedBalance);
    
    // Update loss streak based on win/loss
    if (isWin) {
      setLossStreak(0); // Reset streak on win
      playWinSound();
      // Show winning visual effect
      setShowWinningEffect(true);
      setTimeout(() => setShowWinningEffect(false), 3000);
      
      currentBalance += currentWinnings;
      localStorage.setItem('demoBalance', currentBalance.toString());
      
      toast({
        title: "Demo Win!",
        description: `You won $${currentWinnings.toFixed(2)} in demo mode!`,
      });
    } else {
      setLossStreak(prev => prev + 1); // Increment streak on loss
    }
    
    // Add to demo bet history (localStorage)
    const demoHistory = JSON.parse(localStorage.getItem('demoBetHistory') || '[]');
    const newBet = {
      id: Date.now(),
      bet_amount: parseFloat(betAmount),
      multiplier: finalMultiplier.toFixed(1) + 'x',
      payout: isWin ? currentWinnings : 0,
      created_at: new Date().toISOString(),
      status: isWin ? 'won' : 'lost'
    };
    demoHistory.unshift(newBet);
    localStorage.setItem('demoBetHistory', JSON.stringify(demoHistory.slice(0, 50))); // Keep last 50
    
    setGameStatus("waiting");
    setPlanePosition(0);
  };

  const toggleMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      // Switching to demo mode
      if (!localStorage.getItem('demoBalance')) {
        localStorage.setItem('demoBalance', '1000');
      }
    } else {
      // Switching to real mode - check if user is logged in
      if (!isAuthenticated) {
        setShowAuthModal(true);
        setIsDemoMode(true); // Keep in demo mode if not authenticated
        return;
      }
    }
  };

  const handleLogin = (username: string) => {
    setIsDemoMode(false);
    setShowAuthModal(false);
  };

  const currentBalance = isDemoMode 
    ? parseFloat(localStorage.getItem('demoBalance') || '1000')
    : balance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Demo/Real Mode Toggle with Balance and Username - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-4 py-2">
          {/* Username Display */}
          {(username || isDemoMode) && (
            <Link to="/my-account" className="flex items-center space-x-2 hover:bg-slate-700/50 rounded-lg px-2 py-1 transition-colors">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                {isDemoMode ? 'Demo User' : (username || 'User')}
              </span>
            </Link>
          )}
          
          {/* Balance Display */}
          <div className="text-right">
            <div className="text-lg font-bold text-cyan-400">
              ${currentBalance.toFixed(2)} USDT
            </div>
            <div className={`text-xs font-medium ${
              isDemoMode ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {isDemoMode ? 'Demo' : 'Real'}
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isDemoMode ? 'text-yellow-400' : 'text-gray-400'}`}>
              Demo
            </span>
            <Switch
              checked={!isDemoMode}
              onCheckedChange={toggleMode}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-yellow-500"
            />
            <span className={`text-sm font-medium ${!isDemoMode ? 'text-green-400' : 'text-gray-400'}`}>
              Real
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Game Display - Left Side */}
          <div className="flex-1">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4 sm:p-6 h-64 sm:h-96">
              <div className="relative h-full bg-gradient-to-b from-blue-400/30 via-blue-600/20 to-blue-800/30 rounded-lg overflow-hidden">
                
                {/* Water and Sky Background */}
                <div className="absolute inset-0">
                  {/* Sky */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-sky-400/30 to-blue-500/20" />
                  
                  {/* Water */}
                  <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-blue-900/40 to-blue-600/30">
                    {/* Water waves */}
                    <div className="absolute inset-0 opacity-30">
                      <Waves className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 h-4 w-4 sm:h-6 sm:w-6 text-blue-300 animate-pulse" />
                      <Waves className="absolute bottom-8 sm:bottom-16 left-16 sm:left-32 h-3 w-3 sm:h-4 sm:w-4 text-blue-200 animate-pulse delay-500" />
                      <Waves className="absolute bottom-6 sm:bottom-12 left-28 sm:left-56 h-4 w-4 sm:h-5 sm:w-5 text-blue-300 animate-pulse delay-1000" />
                    </div>
                  </div>
                  
                  {/* Island at the end */}
                  <div className="absolute bottom-0 right-2 sm:right-4 w-12 sm:w-24 h-8 sm:h-16">
                    <Mountain className="h-6 w-6 sm:h-12 sm:w-12 text-green-600" />
                    <div className="absolute bottom-0 right-0 w-8 sm:w-16 h-2 sm:h-4 bg-green-700/60 rounded-full" />
                  </div>
                </div>
                
                {/* Flight Path */}
                <div className="absolute inset-2 sm:inset-4 flex items-center">
                  <div className="w-full h-1 sm:h-2 bg-cyan-500/20 rounded-full relative">
                    {/* Flight progress */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-100"
                      style={{ width: `${planePosition}%` }}
                    />
                  </div>
                </div>

                {/* Multiplier Boxes */}
                {multiplierBoxes.map((box) => (
                  <div 
                    key={box.id}
                    className={`absolute top-1/4 transition-all duration-300 z-10 ${
                      box.hit ? 'animate-pulse scale-110' : ''
                    }`}
                    style={{ left: `${box.position}%`, transform: "translateX(-50%)" }}
                  >
                    {box.revealed ? (
                      <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-2 font-bold text-xs sm:text-sm ${
                        box.multiplier < 1 
                          ? "bg-red-500/80 border-red-400 text-red-100" 
                          : box.multiplier > 3
                          ? "bg-yellow-500/80 border-yellow-400 text-yellow-100"
                          : "bg-green-500/80 border-green-400 text-green-100"
                      }`}>
                        {box.multiplier < 1 ? <Bomb className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" /> : <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" />}
                        {box.multiplier}x
                      </div>
                    ) : (
                      <div className="w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500/60 to-cyan-500/60 border border-white/30 rounded-lg animate-pulse">
                        <Gift className="h-2 w-2 sm:h-4 sm:w-4 text-white/80 m-1 sm:m-2" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Airplane */}
                <div 
                  className="absolute top-1/3 transition-all duration-100 ease-linear z-20"
                  style={{ left: `${planePosition}%`, transform: "translateX(-50%)" }}
                >
                  <Plane className="h-4 w-4 sm:h-8 sm:w-8 text-white transform rotate-12 animate-pulse drop-shadow-lg" />
                  {/* Plane trail */}
                  <div className="absolute top-1 sm:top-2 left-[-10px] sm:left-[-20px] w-2 sm:w-4 h-0.5 sm:h-1 bg-white/50 rounded-full animate-pulse" />
                </div>

                {/* Current Multiplier Display */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  <div className="bg-slate-900/80 rounded-lg px-2 sm:px-4 py-1 sm:py-2 border border-cyan-500/30">
                    <div className="text-lg sm:text-2xl font-bold text-cyan-400">
                      {currentMultiplier.toFixed(2)}x
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      ${currentWinnings.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Winning Effect Overlay */}
                {showWinningEffect && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Confetti particles */}
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random()}s`
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </div>
                    ))}
                    {/* Winner text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg animate-pulse shadow-lg">
                        🎉 BIG WIN! 🎉
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Status */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    gameStatus === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                    gameStatus === "flying" ? "bg-green-500/20 text-green-400" :
                    gameStatus === "collect" ? "bg-blue-500/20 text-blue-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {gameStatus === "waiting" ? "Ready" :
                     gameStatus === "flying" ? "Flying" :
                     gameStatus === "collect" ? "Collect!" :
                     "Crashed"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Control Panel - Right Side */}
          <div className="w-full lg:w-80 space-y-4">
            
            {/* Bet Controls */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">✈️ Flight Controls</h3>
              
              <div className="space-y-4">
                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bet Amount (USDT)
                  </label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Min: $10"
                    min="10"
                    step="0.01"
                    disabled={gameStatus !== "waiting"}
                  />
                </div>

                {/* Quick Bet Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
                      onClick={() => setBetAmount(amount.toString())}
                      disabled={gameStatus !== "waiting"}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                {/* Max Bet Button */}
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
                  onClick={() => setBetAmount(Math.floor(currentBalance).toString())}
                  disabled={gameStatus !== "waiting"}
                >
                  Max Bet (${Math.floor(currentBalance)})
                </Button>

                {/* Bet/Cash Out Button */}
                {gameStatus === "waiting" && (
                  <Button
                    onClick={startGame}
                    disabled={!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > currentBalance}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 text-lg"
                  >
                    🚀 Place Bet & Fly!
                  </Button>
                )}

                {gameStatus === "flying" && (
                  <Button
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 text-lg animate-pulse"
                  >
                    💰 Cash Out ${currentWinnings.toFixed(2)}
                  </Button>
                )}

                {(gameStatus === "collect" || gameStatus === "crashed") && (
                  <Button
                    onClick={collectWinnings}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 text-lg"
                  >
                    🎁 Collect Winnings
                  </Button>
                )}
              </div>
            </Card>

            {/* Recent Results */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Game Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="text-cyan-400 font-bold">${currentBalance.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Loss Streak:</span>
                  <span className={`font-bold ${lossStreak > 5 ? 'text-red-400' : lossStreak > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {lossStreak}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mode:</span>
                  <span className={`font-bold ${isDemoMode ? 'text-yellow-400' : 'text-green-400'}`}>
                    {isDemoMode ? 'Demo' : 'Real Money'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Navigation Links */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">🔗 Quick Links</h3>
              
              <div className="space-y-2">
                <Link to="/history">
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    📈 Betting History
                  </Button>
                </Link>
                
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    🏆 Leaderboard
                  </Button>
                </Link>
                
                <Link to="/my-account">
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    💳 My Account
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plane, TrendingUp, Bomb, DollarSign, Waves, Mountain, Gift } from "lucide-react";

interface MultiplierBox {
  id: number;
  multiplier: number;
  revealed: boolean;
  hit: boolean;
  position: number;
}

interface BetHistoryEntry {
  id: number;
  amount: number;
  multiplier: string;
  winnings: number;
  time: string;
  status: "won" | "lost";
}

interface Transaction {
  id: number;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  time: string;
  status: "completed" | "pending";
}

export const GameInterface = () => {
  const [betAmount, setBetAmount] = useState("50");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "flying" | "crashed" | "landed" | "collect">("waiting");
  const [planePosition, setPlanePosition] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [multiplierBoxes, setMultiplierBoxes] = useState<MultiplierBox[]>([]);
  const [currentWinnings, setCurrentWinnings] = useState(0);

  // Load user data from localStorage
  useEffect(() => {
    const demoUser = localStorage.getItem('demoUser');
    const betHistory = localStorage.getItem('betHistory');
    const transactions = localStorage.getItem('transactions');
    
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      setBalance(userData.balance);
      setIsDemoMode(userData.isDemo);
    }
  }, []);

  // Save user data to localStorage
  const saveUserData = (newBalance: number, isDemo: boolean) => {
    const userData = {
      balance: newBalance,
      isDemo: isDemo
    };
    localStorage.setItem('demoUser', JSON.stringify(userData));
    setBalance(newBalance);
  };

  // Add bet to history
  const addBetToHistory = (bet: Omit<BetHistoryEntry, 'id'>) => {
    const existingHistory = JSON.parse(localStorage.getItem('betHistory') || '[]');
    const newBet = {
      ...bet,
      id: Date.now()
    };
    const updatedHistory = [newBet, ...existingHistory];
    localStorage.setItem('betHistory', JSON.stringify(updatedHistory));
  };

  // Add transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction = {
      ...transaction,
      id: Date.now()
    };
    const updatedTransactions = [newTransaction, ...existingTransactions];
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  // Generate random multiplier boxes for each round with reasonable multipliers
  const generateMultiplierBoxes = () => {
    const boxes: MultiplierBox[] = [];
    for (let i = 0; i < 6; i++) {
      const rand = Math.random();
      let multiplier;
      
      if (rand < 0.3) {
        // 30% chance for reduction multipliers (0.5x - 0.9x)
        multiplier = +(Math.random() * 0.4 + 0.5).toFixed(1);
      } else if (rand < 0.8) {
        // 50% chance for small to medium multipliers (1.1x - 3.0x)
        multiplier = +(Math.random() * 1.9 + 1.1).toFixed(1);
      } else {
        // 20% chance for big multipliers (3.1x - 8x)
        multiplier = +(Math.random() * 4.9 + 3.1).toFixed(1);
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

  const startGame = () => {
    if (parseFloat(betAmount) > balance) {
      alert("Insufficient balance!");
      return;
    }
    
    setGameStatus("flying");
    setPlanePosition(0);
    setCurrentMultiplier(1.0);
    setCurrentWinnings(parseFloat(betAmount));
    
    const newBalance = balance - parseFloat(betAmount);
    saveUserData(newBalance, isDemoMode);
    
    // Add bet transaction
    addTransaction({
      type: "bet",
      amount: parseFloat(betAmount),
      time: new Date().toLocaleString(),
      status: "completed"
    });
  };

  const cashOut = () => {
    if (gameStatus === "flying") {
      setGameStatus("collect");
    }
  };

  const collectWinnings = () => {
    const finalMultiplier = currentMultiplier.toFixed(1) + "x";
    const isWin = currentWinnings > parseFloat(betAmount);
    
    // Add to bet history
    addBetToHistory({
      amount: parseFloat(betAmount),
      multiplier: finalMultiplier,
      winnings: isWin ? currentWinnings : 0,
      time: new Date().toLocaleString(),
      status: isWin ? "won" : "lost"
    });

    if (isWin) {
      const newBalance = balance + currentWinnings;
      saveUserData(newBalance, isDemoMode);
      
      // Add win transaction
      addTransaction({
        type: "win",
        amount: currentWinnings,
        time: new Date().toLocaleString(),
        status: "completed"
      });
    }
    
    setGameStatus("waiting");
    setPlanePosition(0);
  };

  const toggleMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      // Switching to demo mode
      saveUserData(1000, true);
    } else {
      // Switching to real mode
      saveUserData(0, false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Demo/Real Mode Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-3 py-2">
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

                {/* Game Status */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    gameStatus === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                    gameStatus === "flying" ? "bg-green-500/20 text-green-400" :
                    gameStatus === "collect" ? "bg-blue-500/20 text-blue-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {gameStatus === "waiting" ? "Ready for Takeoff" :
                     gameStatus === "flying" ? "Cruising to Island" :
                     gameStatus === "collect" ? "Landed Safely" :
                     "Crashed"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Betting Panel - Right Side */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Balance Display */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  ${balance.toFixed(2)} USDT
                </div>
                <div className={`text-sm font-medium ${
                  isDemoMode ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {isDemoMode ? 'Demo Balance' : 'Real Balance'}
                </div>
              </div>
            </Card>

            {/* Betting Controls */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h3 className="text-lg font-bold text-white mb-4">Place Your Bet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bet Amount (USDT)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                      min="1"
                      max={balance}
                      step="10"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Balance: ${balance.toFixed(2)} | Min bet: $1
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount("50")}
                    className="border-slate-600 text-gray-300 text-xs"
                  >
                    $50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount("100")}
                    className="border-slate-600 text-gray-300 text-xs"
                  >
                    $100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount((balance / 2).toString())}
                    className="border-slate-600 text-gray-300 text-xs"
                  >
                    Half
                  </Button>
                </div>

                {gameStatus === "waiting" ? (
                  <Button 
                    onClick={startGame}
                    disabled={parseFloat(betAmount) > balance || parseFloat(betAmount) < 1}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 disabled:opacity-50"
                  >
                    🛫 Start Flight to Island
                  </Button>
                ) : gameStatus === "flying" ? (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 animate-pulse"
                  >
                    🏝️ Cash Out - ${currentWinnings.toFixed(2)}
                  </Button>
                ) : gameStatus === "collect" ? (
                  <Button 
                    onClick={collectWinnings}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3"
                  >
                    💰 Collect Winnings - ${currentWinnings.toFixed(2)}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setGameStatus("waiting")}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3"
                  >
                    🔄 Next Flight
                  </Button>
                )}
              </div>
            </Card>

            {/* Round Info */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h4 className="text-base font-semibold text-white mb-2">This Round</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mystery Boxes:</span>
                  <span className="text-purple-400 font-semibold">{multiplierBoxes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination:</span>
                  <span className="text-green-400 font-semibold">🏝️ Island</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

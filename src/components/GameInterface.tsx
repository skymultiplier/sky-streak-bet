
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plane, TrendingUp, Bomb, DollarSign, Waves, Mountain } from "lucide-react";

export const GameInterface = () => {
  const [betAmount, setBetAmount] = useState("50");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "flying" | "crashed" | "landed">("waiting");
  const [planePosition, setPlanePosition] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [balance, setBalance] = useState(1000);

  // Load demo user data from localStorage if available
  useEffect(() => {
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      const userData = JSON.parse(demoUser);
      setBalance(userData.balance);
      setIsDemoMode(userData.isDemo);
    }
  }, []);

  // Generate random multipliers for the round
  const [roundMultipliers] = useState(() => {
    return Array.from({ length: 8 }, () => {
      const rand = Math.random();
      if (rand < 0.3) return +(Math.random() * 0.5 + 0.5).toFixed(1); // Bomb zones (0.5-1.0x)
      return +(Math.random() * 4 + 1.2).toFixed(1); // Good zones (1.2-5.2x)
    });
  });

  // Demo animation
  useEffect(() => {
    if (gameStatus === "flying") {
      const interval = setInterval(() => {
        setPlanePosition(prev => {
          if (prev >= 90) {
            setGameStatus("landed");
            return 90;
          }
          return prev + 2;
        });
        
        setCurrentMultiplier(prev => prev + 0.1);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameStatus]);

  const startGame = () => {
    if (parseFloat(betAmount) > balance) {
      alert("Insufficient balance!");
      return;
    }
    
    setGameStatus("flying");
    setPlanePosition(0);
    setCurrentMultiplier(1.0);
    setBalance(prev => prev - parseFloat(betAmount));
  };

  const cashOut = () => {
    if (gameStatus === "flying") {
      setGameStatus("landed");
      const winnings = parseFloat(betAmount) * currentMultiplier;
      setBalance(prev => prev + winnings);
    }
  };

  const toggleMode = () => {
    setIsDemoMode(!isDemoMode);
    if (!isDemoMode) {
      // Switching to demo mode
      setBalance(1000);
    } else {
      // Switching to real mode
      setBalance(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Wallet Balance Header */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">
                ${balance.toFixed(2)} USDT
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isDemoMode ? 'text-yellow-400' : 'text-gray-400'}`}>
                  DEMO
                </span>
                <Switch
                  checked={!isDemoMode}
                  onCheckedChange={toggleMode}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className={`text-sm font-medium ${!isDemoMode ? 'text-green-400' : 'text-gray-400'}`}>
                  REAL
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Mode</div>
              <div className={`text-lg font-semibold ${isDemoMode ? 'text-yellow-400' : 'text-green-400'}`}>
                {isDemoMode ? 'Demo Play' : 'Real Money'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Game Arena */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6 h-96">
              <div className="relative h-full bg-gradient-to-b from-blue-400/30 via-blue-600/20 to-blue-800/30 rounded-lg overflow-hidden">
                
                {/* Water and Sky Background */}
                <div className="absolute inset-0">
                  {/* Sky */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-sky-400/30 to-blue-500/20" />
                  
                  {/* Water */}
                  <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-blue-900/40 to-blue-600/30">
                    {/* Water waves */}
                    <div className="absolute inset-0 opacity-30">
                      <Waves className="absolute bottom-10 left-10 h-6 w-6 text-blue-300 animate-pulse" />
                      <Waves className="absolute bottom-16 left-32 h-4 w-4 text-blue-200 animate-pulse delay-500" />
                      <Waves className="absolute bottom-12 left-56 h-5 w-5 text-blue-300 animate-pulse delay-1000" />
                    </div>
                  </div>
                  
                  {/* Island at the end */}
                  <div className="absolute bottom-0 right-4 w-24 h-16">
                    <Mountain className="h-12 w-12 text-green-600" />
                    <div className="absolute bottom-0 right-0 w-16 h-4 bg-green-700/60 rounded-full" />
                  </div>
                </div>
                
                {/* Flight Path with Multipliers */}
                <div className="absolute inset-4 flex items-center">
                  <div className="w-full h-2 bg-cyan-500/20 rounded-full relative">
                    {/* Multiplier zones along the path */}
                    {roundMultipliers.map((multiplier, index) => (
                      <div 
                        key={index}
                        className={`absolute top-[-24px] text-xs font-bold px-2 py-1 rounded ${
                          multiplier < 1 
                            ? "bg-red-500/30 text-red-300 border border-red-500/50" 
                            : "bg-green-500/30 text-green-300 border border-green-500/50"
                        }`}
                        style={{ left: `${(index / roundMultipliers.length) * 100}%` }}
                      >
                        {multiplier < 1 ? <Bomb className="h-3 w-3 inline mr-1" /> : <TrendingUp className="h-3 w-3 inline mr-1" />}
                        {multiplier}x
                      </div>
                    ))}
                    
                    {/* Flight progress */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-100"
                      style={{ width: `${planePosition}%` }}
                    />
                  </div>
                </div>

                {/* Airplane */}
                <div 
                  className="absolute top-1/3 transition-all duration-100 ease-linear z-10"
                  style={{ left: `${planePosition}%`, transform: "translateX(-50%)" }}
                >
                  <Plane className="h-8 w-8 text-white transform rotate-12 animate-pulse drop-shadow-lg" />
                  {/* Plane trail */}
                  <div className="absolute top-2 left-[-20px] w-4 h-1 bg-white/50 rounded-full animate-pulse" />
                </div>

                {/* Current Multiplier Display */}
                <div className="absolute top-4 left-4">
                  <div className="bg-slate-900/80 rounded-lg px-4 py-2 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">
                      {currentMultiplier.toFixed(2)}x
                    </div>
                    <div className="text-sm text-gray-400">
                      ${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Game Status */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    gameStatus === "waiting" ? "bg-yellow-500/20 text-yellow-400" :
                    gameStatus === "flying" ? "bg-green-500/20 text-green-400" :
                    gameStatus === "landed" ? "bg-blue-500/20 text-blue-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {gameStatus === "waiting" ? "Ready for Takeoff" :
                     gameStatus === "flying" ? "Cruising to Island" :
                     gameStatus === "landed" ? "Landed Safely" :
                     "Crashed"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Betting Panel */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
              
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount("50")}
                    className="border-slate-600 text-gray-300"
                  >
                    $50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount("100")}
                    className="border-slate-600 text-gray-300"
                  >
                    $100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount((balance / 2).toString())}
                    className="border-slate-600 text-gray-300"
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
                    🏝️ Land Now - ${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}
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
              <h4 className="text-lg font-semibold text-white mb-2">This Round</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Flight Path:</span>
                  <span className="text-cyan-400 font-semibold">Random Multipliers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination:</span>
                  <span className="text-green-400 font-semibold">🏝️ Island</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className={`font-semibold ${isDemoMode ? 'text-yellow-400' : 'text-green-400'}`}>
                    {isDemoMode ? 'Demo' : 'Real'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plane, TrendingUp, Bomb, DollarSign } from "lucide-react";

export const GameInterface = () => {
  const [betAmount, setBetAmount] = useState("50");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameStatus, setGameStatus] = useState<"waiting" | "flying" | "crashed" | "landed">("waiting");
  const [planePosition, setPlanePosition] = useState(0);

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
    setGameStatus("flying");
    setPlanePosition(0);
    setCurrentMultiplier(1.0);
  };

  const cashOut = () => {
    if (gameStatus === "flying") {
      setGameStatus("landed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* Game Arena */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-cyan-500/20 p-6 h-96">
              <div className="relative h-full bg-gradient-to-t from-slate-900/50 to-transparent rounded-lg overflow-hidden">
                
                {/* Sky Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-slate-900/30" />
                
                {/* Multiplier Zones */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-4 w-full h-full p-4">
                    {[1.2, 2.5, 0.8, 3.0, 1.8, 4.2, 0.5, 5.0].map((multiplier, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-center rounded-lg text-sm font-bold ${
                          multiplier < 1 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {multiplier < 1 ? <Bomb className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                        {multiplier}x
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plane */}
                <div 
                  className="absolute top-1/2 transition-all duration-100 ease-linear"
                  style={{ left: `${planePosition}%`, transform: "translateY(-50%)" }}
                >
                  <Plane className="h-8 w-8 text-cyan-400 transform rotate-45 animate-pulse" />
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
                    {gameStatus === "waiting" ? "Ready to Fly" :
                     gameStatus === "flying" ? "In Flight" :
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
                    Bet Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                      min="50"
                      step="10"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum bet: $50</p>
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
                    onClick={() => setBetAmount("500")}
                    className="border-slate-600 text-gray-300"
                  >
                    $500
                  </Button>
                </div>

                {gameStatus === "waiting" ? (
                  <Button 
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
                  >
                    🛫 Start Flight
                  </Button>
                ) : gameStatus === "flying" ? (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 animate-pulse"
                  >
                    💰 Cash Out ${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setGameStatus("waiting")}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3"
                  >
                    🔄 Play Again
                  </Button>
                )}
              </div>
            </Card>

            {/* Wallet Info */}
            <Card className="bg-slate-800/50 border-cyan-500/20 p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Wallet</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-green-400 font-semibold">$1,250.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">In Play:</span>
                  <span className="text-yellow-400 font-semibold">${betAmount}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-cyan-500/30 text-cyan-400">
                Deposit / Withdraw
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

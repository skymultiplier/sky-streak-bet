
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Plane } from "lucide-react";

const mockBetHistory = [
  { id: 1, amount: 50, multiplier: "2.4x", winnings: 120, time: "2 mins ago", status: "won" },
  { id: 2, amount: 100, multiplier: "1.8x", winnings: 180, time: "5 mins ago", status: "won" },
  { id: 3, amount: 75, multiplier: "0.5x", winnings: 0, time: "8 mins ago", status: "lost" },
  { id: 4, amount: 25, multiplier: "3.2x", winnings: 80, time: "12 mins ago", status: "won" },
  { id: 5, amount: 150, multiplier: "1.2x", winnings: 180, time: "15 mins ago", status: "won" },
  { id: 6, amount: 80, multiplier: "0.8x", winnings: 0, time: "18 mins ago", status: "lost" },
  { id: 7, amount: 200, multiplier: "4.5x", winnings: 900, time: "22 mins ago", status: "won" },
  { id: 8, amount: 60, multiplier: "1.5x", winnings: 90, time: "25 mins ago", status: "won" },
];

export const History = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Bet History
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your recent flights and winnings
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6 mb-6">
            <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-300">
              <div>Time</div>
              <div>Bet Amount</div>
              <div>Multiplier</div>
              <div>Winnings</div>
              <div>Status</div>
            </div>
          </Card>

          {/* History Entries */}
          <div className="space-y-3">
            {mockBetHistory.map((bet) => (
              <Card 
                key={bet.id} 
                className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="grid grid-cols-5 gap-4 items-center">
                  
                  {/* Time */}
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {bet.time}
                  </div>

                  {/* Bet Amount */}
                  <div className="font-semibold text-white">
                    ${bet.amount}
                  </div>

                  {/* Multiplier */}
                  <div>
                    <span className={`inline-flex items-center border rounded-full px-3 py-1 text-sm font-semibold ${
                      parseFloat(bet.multiplier) >= 1 
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}>
                      <Plane className="h-3 w-3 mr-1" />
                      {bet.multiplier}
                    </span>
                  </div>

                  {/* Winnings */}
                  <div className={`font-bold ${bet.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                    {bet.status === 'won' ? `$${bet.winnings}` : '$0'}
                  </div>

                  {/* Status */}
                  <div>
                    {bet.status === 'won' ? (
                      <span className="inline-flex items-center bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-1 text-xs font-semibold">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Won
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-1 text-xs font-semibold">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Lost
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">$1,550</div>
              <div className="text-gray-400">Total Winnings</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">4.5x</div>
              <div className="text-gray-400">Best Multiplier</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">8</div>
              <div className="text-gray-400">Flights Today</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

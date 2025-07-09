
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Clock, DollarSign } from "lucide-react";

export const Leaderboard = () => {
  // Generate random wins for this week
  const thisWeekWins = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    username: `Player${Math.floor(Math.random() * 1000)}`,
    amount: Math.floor(Math.random() * 50000) + 5000,
    multiplier: (Math.random() * 50 + 2).toFixed(1),
    time: `${Math.floor(Math.random() * 6) + 1} days ago`
  }));

  // Generate random wins for last 24 hours
  const last24HoursWins = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    username: `Player${Math.floor(Math.random() * 1000)}`,
    amount: Math.floor(Math.random() * 25000) + 2000,
    multiplier: (Math.random() * 30 + 2).toFixed(1),
    time: `${Math.floor(Math.random() * 24) + 1}h ago`
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Top wins and biggest multipliers from our community
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* This Week */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">This Week</h2>
            </div>
            
            <div className="space-y-3">
              {thisWeekWins.slice(0, 8).map((win, index) => (
                <div key={win.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{win.username}</div>
                      <div className="text-gray-400 text-sm">{win.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${win.amount.toLocaleString()}</div>
                    <div className="text-cyan-400 text-sm">{win.multiplier}x</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Last 24 Hours */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Last 24 Hours</h2>
            </div>
            
            <div className="space-y-3">
              {last24HoursWins.map((win, index) => (
                <div key={win.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm font-bold text-green-400">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{win.username}</div>
                      <div className="text-gray-400 text-sm">{win.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${win.amount.toLocaleString()}</div>
                    <div className="text-cyan-400 text-sm">{win.multiplier}x</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6 text-center">
            <TrendingUp className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">99.2%</div>
            <div className="text-gray-400">Payout Rate</div>
          </Card>
          
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">$2.4M</div>
            <div className="text-gray-400">Total Winnings</div>
          </Card>
          
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">15,420</div>
            <div className="text-gray-400">Active Players</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

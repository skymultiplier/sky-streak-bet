
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const leaderboardData = [
  { rank: 1, username: "SkyAce", amount: 15420.50, multiplier: "12.5x", time: "2 mins ago" },
  { rank: 2, username: "CloudSurfer", amount: 8750.25, multiplier: "8.2x", time: "5 mins ago" },
  { rank: 3, username: "JetPilot", amount: 6230.75, multiplier: "6.1x", time: "8 mins ago" },
  { rank: 4, username: "AirForce1", amount: 4890.30, multiplier: "4.9x", time: "12 mins ago" },
  { rank: 5, username: "WingCommander", amount: 3650.80, multiplier: "3.7x", time: "15 mins ago" },
  { rank: 6, username: "TopGun", amount: 2940.60, multiplier: "2.9x", time: "18 mins ago" },
  { rank: 7, username: "FlyHigh", amount: 2180.40, multiplier: "2.2x", time: "22 mins ago" },
  { rank: 8, username: "SkyWalker", amount: 1850.90, multiplier: "1.9x", time: "25 mins ago" },
];

export const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Top pilots who've mastered the skies and claimed the biggest wins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="bg-slate-800/50 border-cyan-500/20 p-6 mb-6">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 text-sm font-semibold text-gray-300">
              <div>Rank</div>
              <div>Player</div>
              <div>Winnings</div>
              <div className="hidden md:block">Multiplier</div>
              <div className="hidden md:block">Time</div>
              <div>Status</div>
            </div>
          </Card>

          {/* Leaderboard Entries */}
          <div className="space-y-3">
            {leaderboardData.map((entry) => (
              <Card 
                key={entry.rank} 
                className={`bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-all duration-300 ${
                  entry.rank <= 3 ? 'ring-1 ring-yellow-500/20' : ''
                }`}
              >
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 items-center">
                  
                  {/* Rank */}
                  <div className="flex items-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Username */}
                  <div className="font-semibold text-white">
                    {entry.username}
                  </div>

                  {/* Amount */}
                  <div className="font-bold text-green-400">
                    ${entry.amount.toLocaleString()}
                  </div>

                  {/* Multiplier - Hidden on mobile */}
                  <div className="hidden md:block">
                    <span className="inline-flex items-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-3 py-1 text-sm font-semibold text-cyan-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {entry.multiplier}
                    </span>
                  </div>

                  {/* Time - Hidden on mobile */}
                  <div className="hidden md:block text-gray-400 text-sm">
                    {entry.time}
                  </div>

                  {/* Status */}
                  <div>
                    <span className="inline-flex items-center bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-1 text-xs font-semibold">
                      Landed
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">$15,420.50</div>
              <div className="text-gray-400">Biggest Win Today</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">12.5x</div>
              <div className="text-gray-400">Highest Multiplier</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">1,247</div>
              <div className="text-gray-400">Games Played Today</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

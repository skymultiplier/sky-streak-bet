
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp, Clock } from "lucide-react";

const weeklyLeaderboard = [
  { rank: 1, username: "SkyAce", amount: 45420.50, multiplier: "15.2x", time: "3 days ago" },
  { rank: 2, username: "CloudSurfer", amount: 38750.25, multiplier: "12.8x", time: "2 days ago" },
  { rank: 3, username: "JetPilot", amount: 26230.75, multiplier: "8.1x", time: "4 days ago" },
  { rank: 4, username: "AirForce1", username: "WingCommander", amount: 18650.80, multiplier: "7.7x", time: "1 day ago" },
  { rank: 5, username: "TopGun", amount: 15940.60, multiplier: "6.9x", time: "5 days ago" },
];

const dailyLeaderboard = [
  { rank: 1, username: "SkyAce", amount: 15420.50, multiplier: "12.5x", time: "2 mins ago" },
  { rank: 2, username: "CloudSurfer", amount: 8750.25, multiplier: "8.2x", time: "5 mins ago" },
  { rank: 3, username: "JetPilot", amount: 6230.75, multiplier: "6.1x", time: "8 mins ago" },
  { rank: 4, username: "AirForce1", amount: 4890.30, multiplier: "4.9x", time: "12 mins ago" },
  { rank: 5, username: "WingCommander", amount: 3650.80, multiplier: "3.7x", time: "15 mins ago" },
];

export const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const LeaderboardTable = ({ data, title }: { data: typeof dailyLeaderboard, title: string }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
        <Clock className="h-6 w-6 mr-2" />
        {title}
      </h2>
      
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
        {data.map((entry) => (
          <Card 
            key={`${title}-${entry.rank}`} 
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
    </div>
  );

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
          {/* Last 24 Hours Leaderboard */}
          <LeaderboardTable data={dailyLeaderboard} title="Last 24 Hours" />

          {/* This Week Leaderboard */}
          <LeaderboardTable data={weeklyLeaderboard} title="This Week" />

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">$45,420.50</div>
              <div className="text-gray-400">Biggest Win This Week</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">15.2x</div>
              <div className="text-gray-400">Highest Multiplier</div>
            </Card>
            
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">2,847</div>
              <div className="text-gray-400">Total Flights Today</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

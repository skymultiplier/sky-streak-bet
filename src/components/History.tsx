
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Plane } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface BetHistoryEntry {
  id: string;
  bet_amount: number;
  payout: number;
  created_at: string;
  status: "won" | "lost" | "pending" | "cancelled";
  game_id: string | null;
}

export const History = () => {
  const { user, loading } = useAuth();
  const [betHistory, setBetHistory] = useState<BetHistoryEntry[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [bestMultiplier, setBestMultiplier] = useState("0x");
  const [flightsToday, setFlightsToday] = useState(0);

  useEffect(() => {
    if (user) {
      fetchBetHistory();
    }
  }, [user]);

  const fetchBetHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bet history:', error);
        return;
      }

      setBetHistory(data || []);
      
      // Calculate stats
      const totalWins = data?.reduce((sum, bet) => 
        sum + (bet.status === 'won' ? bet.payout : 0), 0) || 0;
      setTotalWinnings(totalWins);
      
      // Find best multiplier
      const best = data?.reduce((max, bet) => {
        if (bet.status === 'won' && bet.payout > 0) {
          const currentMult = bet.payout / bet.bet_amount;
          const maxMult = parseFloat(max.replace('x', ''));
          return currentMult > maxMult ? currentMult.toFixed(1) + 'x' : max;
        }
        return max;
      }, "0x") || "0x";
      setBestMultiplier(best);
      
      // Count today's flights
      const today = new Date().toDateString();
      const todayFlights = data?.filter(bet => 
        new Date(bet.created_at).toDateString() === today).length || 0;
      setFlightsToday(todayFlights);
    } catch (error) {
      console.error('Error fetching bet history:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your history</h2>
          <p className="text-gray-400">You need to be logged in to view your betting history.</p>
        </div>
      </div>
    );
  }

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
          {betHistory.length === 0 ? (
            <Card className="bg-slate-800/50 border-cyan-500/20 p-12">
              <div className="text-center">
                <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Bets Placed Yet</h3>
                <p className="text-gray-400">
                  Start playing to see your bet history here
                </p>
              </div>
            </Card>
          ) : (
            <>
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
                {betHistory.map((bet) => (
                  <Card 
                    key={bet.id} 
                    className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-4 hover:border-cyan-500/40 transition-all duration-300"
                  >
                    <div className="grid grid-cols-5 gap-4 items-center">
                      
                      {/* Time */}
                      <div className="flex items-center text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(bet.created_at).toLocaleTimeString()}
                      </div>

                      {/* Bet Amount */}
                      <div className="font-semibold text-white">
                        ${bet.bet_amount.toFixed(2)}
                      </div>

                      {/* Multiplier */}
                      <div>
                        <span className={`inline-flex items-center border rounded-full px-3 py-1 text-sm font-semibold ${
                          bet.status === 'won' && bet.payout > bet.bet_amount
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : "bg-red-500/20 border-red-500/30 text-red-400"
                        }`}>
                          <Plane className="h-3 w-3 mr-1" />
                          {bet.status === 'won' && bet.payout > 0 
                            ? (bet.payout / bet.bet_amount).toFixed(1) + 'x'
                            : '0.0x'
                          }
                        </span>
                      </div>

                      {/* Winnings */}
                      <div className={`font-bold ${bet.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {bet.status === 'won' ? `$${bet.payout.toFixed(2)}` : '$0.00'}
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
                  <div className="text-3xl font-bold text-green-400 mb-2">${totalWinnings.toFixed(2)}</div>
                  <div className="text-gray-400">Total Winnings</div>
                </Card>
                
                <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{bestMultiplier}</div>
                  <div className="text-gray-400">Best Multiplier</div>
                </Card>
                
                <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{flightsToday}</div>
                  <div className="text-gray-400">Flights Today</div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const HeroSection = () => {
  const navigate = useNavigate();

  const generateRandomUsername = () => {
    const adjectives = ['Flying', 'Sky', 'Turbo', 'Rocket', 'Cyber', 'Neon', 'Elite', 'Alpha', 'Storm', 'Phoenix'];
    const nouns = ['Pilot', 'Ace', 'Flyer', 'Wing', 'Jet', 'Eagle', 'Hawk', 'Thunder', 'Lightning', 'Strike'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${numbers}`;
  };

  const handlePlayDemo = () => {
    const username = generateRandomUsername();
    
    // Store demo user data in localStorage
    localStorage.setItem('demoUser', JSON.stringify({
      username,
      balance: 1000,
      isDemo: true
    }));

    toast({
      title: "Demo Account Created!",
      description: `Welcome ${username}! You have 1,000 USDT to play with.`,
    });

    // Navigate to game page
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          {/* Main Hero Content */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-full px-6 py-2 mb-6">
              <Zap className="h-4 w-4 text-cyan-400 mr-2" />
              <span className="text-cyan-400 font-semibold">Next-Gen Crypto Gaming</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Sky
              </span>
              <span className="text-white">Multiplier</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Navigate through multiplier zones, avoid the bombs, and cash out at the perfect moment. 
              The ultimate aviation-themed crypto betting experience.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg"
              onClick={() => navigate('/game')}
            >
              <Plane className="h-5 w-5 mr-2" />
              Start Flying Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 py-4 px-8 text-lg"
              onClick={handlePlayDemo}
            >
              Play Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">$2.5M+</div>
              <div className="text-gray-400">Total Winnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">10,000+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dynamic Multipliers</h3>
              <p className="text-gray-400">
                Navigate through randomized multiplier zones ranging from 1.1x to 100x. 
                Each flight is unique and unpredictable.
              </p>
            </div>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Provably Fair</h3>
              <p className="text-gray-400">
                Transparent, blockchain-verified randomness ensures every game is fair. 
                Verify results with cryptographic proof.
              </p>
            </div>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Payouts</h3>
              <p className="text-gray-400">
                Lightning-fast crypto withdrawals. Cash out your winnings instantly 
                to your wallet with minimal fees.
              </p>
            </div>
          </Card>
        </div>

        {/* Game Preview */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Experience the Thrill</h2>
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-slate-800/30 backdrop-blur-sm border-cyan-500/20 p-8">
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Plane className="h-16 w-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                  <p className="text-xl text-gray-300">Live Game Demo</p>
                  <p className="text-gray-400">Click "Start Flying Now" to begin</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

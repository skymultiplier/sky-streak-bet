import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const langPrefix = `/${language}`;

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
    localStorage.setItem('demoUser', JSON.stringify({ username, balance: 1000, isDemo: true }));
    toast({
      title: t('auth.demoCreated'),
      description: `${t('auth.welcome')} ${username}! ${t('auth.demoBalance')}`,
    });
    navigate(`${langPrefix}/game`);
  };

  const handleStartFlying = () => {
    if (user) {
      navigate(`${langPrefix}/game`);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogin = () => {
    navigate(`${langPrefix}/game`);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Soft animated sky background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 h-40 w-40 bg-cyan-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-56 w-56 bg-blue-600 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/40 rounded-full px-4 py-1 text-cyan-300 text-sm mb-6">
              <Plane className="h-4 w-4" /> Live now · 10,000+ pilots flying
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="text-cyan-400">Sky</span>
              <span className="text-white">Multiplier</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-3 max-w-3xl mx-auto leading-relaxed font-semibold">
              Place your bet. Watch the plane fly through 6 mystery boxes. Collect before it lands.
            </p>
            <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Every box reveals a multiplier — some lift your winnings, some pull them down.
              Time your collect right and walk away with the prize.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 text-lg shadow-lg shadow-cyan-900/50"
              onClick={handleStartFlying}
            >
              <Plane className="h-5 w-5 mr-2" />
              {t('hero.startFlying')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-slate-800 border-cyan-400 text-cyan-300 hover:bg-cyan-500 hover:text-white py-4 px-8 text-lg"
              onClick={handlePlayDemo}
            >
              {t('hero.playDemo')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">$2.5M+</div>
              <div className="text-gray-300">{t('hero.totalWinnings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">10,000+</div>
              <div className="text-gray-300">{t('hero.activePlayers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-300">{t('hero.uptime')}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800 border-cyan-500/20 p-6 hover:border-cyan-400 transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('features.dynamicMultipliers')}</h3>
              <p className="text-gray-300">{t('features.dynamicMultipliersDesc')}</p>
            </div>
          </Card>

          <Card className="bg-slate-800 border-cyan-500/20 p-6 hover:border-cyan-400 transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('features.provablyFair')}</h3>
              <p className="text-gray-300">{t('features.provablyFairDesc')}</p>
            </div>
          </Card>

          <Card className="bg-slate-800 border-cyan-500/20 p-6 hover:border-cyan-400 transition-all">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('features.instantPayouts')}</h3>
              <p className="text-gray-300">{t('features.instantPayoutsDesc')}</p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-3">Feel the thrill</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Every flight is a 10-second adrenaline rush. Mystery boxes, climbing multipliers,
            one tap to collect — your timing decides the prize.
          </p>
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-slate-800 border-cyan-500/30 p-8 overflow-hidden">
              <div className="aspect-video bg-gradient-to-b from-slate-900 to-blue-950 rounded-lg flex items-center justify-center relative">
                {/* Mock flight path */}
                <div className="absolute left-6 right-6 top-1/2 h-1 bg-cyan-500/30 rounded-full" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-cyan-500 border border-white/20 animate-pulse"
                    style={{ left: `${10 + i * 12}%`, animationDelay: `${i * 0.2}s` }}
                  />
                ))}
                <div className="relative z-10 text-center">
                  <Plane className="h-16 w-16 text-cyan-300 mx-auto mb-4 animate-bounce drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                  <p className="text-xl text-white font-semibold">Tap to take off</p>
                  <p className="text-gray-300">Demo mode — no deposit needed</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={handlePlayDemo} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                  <Plane className="h-4 w-4 mr-2" /> Try a free flight
                </Button>
                <Button onClick={handleStartFlying} variant="outline" className="bg-slate-700 border-cyan-400 text-white hover:bg-cyan-600">
                  Play for real
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        defaultToSignUp={true}
      />
    </div>
  );
};

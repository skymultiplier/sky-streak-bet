import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, History, Trophy, Menu, X, LayoutDashboard, Gift, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const lp = `/${language}`;

  const handleLogin = (_username: string) => {
    setShowAuthModal(false);
    navigate(`${lp}/game`);
  };

  const handleSignOut = async () => {
    const ok = await signOut();
    if (ok) {
      toast({ title: t('account.signedOut') || 'Signed out' });
      navigate(lp || '/');
    }
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link to={`${lp}/leaderboard`} onClick={onNavigate}>
        <Button variant="ghost" className="text-gray-300 hover:text-cyan-400 w-full justify-start md:w-auto">
          <Trophy className="h-4 w-4 mr-2" />
          {t('nav.leaderboard')}
        </Button>
      </Link>
      <Link to={`${lp}/history`} onClick={onNavigate}>
        <Button variant="ghost" className="text-gray-300 hover:text-cyan-400 w-full justify-start md:w-auto">
          <History className="h-4 w-4 mr-2" />
          {t('nav.history')}
        </Button>
      </Link>
      {user && (
        <>
          <Link to={`${lp}/game`} onClick={onNavigate}>
            <Button variant="ghost" className="text-gray-300 hover:text-cyan-400 w-full justify-start md:w-auto">
              <Plane className="h-4 w-4 mr-2" />
              {t('nav.gameLounge')}
            </Button>
          </Link>
          <Link to={`${lp}/my-account?tab=referral`} onClick={onNavigate}>
            <Button variant="ghost" className="text-purple-300 hover:text-purple-200 w-full justify-start md:w-auto">
              <Gift className="h-4 w-4 mr-2" />
              {t('nav.referrals') || 'Referrals'}
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={lp || '/'} className="flex items-center space-x-2">
            <div className="relative">
              <Plane className="h-8 w-8 text-cyan-400 transform rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold text-cyan-400">SkyMultiplier</span>
          </Link>

          {!isMobile && (
            <div className="hidden md:flex items-center space-x-3">
              <NavLinks />
              <LanguageSelector />
              {user ? (
                <>
                  <Link to={`${lp}/my-account`}>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t('nav.dashboard') || 'Account Dashboard'}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('account.signOut') || 'Logout'}
                  </Button>
                </>
              ) : (
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowAuthModal(true)}>
                  {t('nav.login')}
                </Button>
              )}
            </div>
          )}

          {isMobile && (
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>

        {isMobile && isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 py-4">
            <div className="flex flex-col space-y-2">
              <NavLinks onNavigate={() => setIsMenuOpen(false)} />
              {user ? (
                <>
                  <Link to={`${lp}/my-account`} onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white w-full justify-start">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t('nav.dashboard') || 'Account Dashboard'}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('account.signOut') || 'Logout'}
                  </Button>
                </>
              ) : (
                <Button className="bg-cyan-600 hover:bg-cyan-700 mt-2" onClick={() => { setIsMenuOpen(false); setShowAuthModal(true); }}>
                  {t('nav.login')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
};

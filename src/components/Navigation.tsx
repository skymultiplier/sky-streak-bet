
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Wallet, History, Trophy, Menu, X, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isMobile = useIsMobile();
  const { user, username } = useAuth();

  const handleLogin = (username: string) => {
    setShowAuthModal(false);
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Plane className="h-8 w-8 text-cyan-400 transform rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SkyMultiplier
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/leaderboard">
                <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              {user ? (
                <Link to="/my-account">
                  <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                    <User className="h-4 w-4 mr-2" />
                    {username || 'Account'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => setShowAuthModal(true)}
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 py-4">
            <div className="flex flex-col space-y-2">
              <Link to="/leaderboard">
                <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400 w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400 w-full">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </Link>
              {user ? (
                <Link to="/my-account">
                  <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400 w-full">
                    <User className="h-4 w-4 mr-2" />
                    {username || 'Account'}
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 mt-2"
                  onClick={() => setShowAuthModal(true)}
                >
                  Login / Sign Up
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


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane, Wallet, History, Trophy, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Plane className="h-8 w-8 text-cyan-400 transform rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SkyMultiplier
            </span>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-cyan-400">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                Login
              </Button>
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
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-cyan-400">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 mt-2">
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

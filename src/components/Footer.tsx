
import { Plane, Twitter, Github, MessageCircle } from "lucide-react";
import { useState } from "react";
import { InfoModal } from "./InfoModal";
import { SupportTicketForm } from "./SupportTicketForm";

export const Footer = () => {
  const [modalType, setModalType] = useState<string | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);

  const handleContactClick = () => {
    setShowSupportForm(true);
  };
  return (
    <footer className="bg-slate-900 border-t border-cyan-500/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-cyan-400 transform rotate-45" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                SkyMultiplier
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              The ultimate aviation-themed crypto betting experience. Navigate the skies and multiply your winnings.
            </p>
          </div>

          {/* Game */}
          <div>
            <h4 className="text-white font-semibold mb-4">Game</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('how-to-play')} className="hover:text-cyan-400 transition-colors text-left">How to Play</button></li>
              <li><button onClick={() => setModalType('game-rules')} className="hover:text-cyan-400 transition-colors text-left">Game Rules</button></li>
              <li><button onClick={() => setModalType('provably-fair')} className="hover:text-cyan-400 transition-colors text-left">Provably Fair</button></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('help-center')} className="hover:text-cyan-400 transition-colors text-left">Help Center</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">Contact Us</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">Bug Reports</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">Feedback</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('terms')} className="hover:text-cyan-400 transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-cyan-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setModalType('responsible-gaming')} className="hover:text-cyan-400 transition-colors text-left">Responsible Gaming</button></li>
              <li><button onClick={() => setModalType('kyc')} className="hover:text-cyan-400 transition-colors text-left">KYC Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 SkyMultiplier. All rights reserved.
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      
      <InfoModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType as any}
      />
      
      <SupportTicketForm
        isOpen={showSupportForm}
        onClose={() => setShowSupportForm(false)}
      />
    </footer>
  );
};

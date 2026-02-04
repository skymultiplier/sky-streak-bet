import { Plane, Twitter, Github, MessageCircle } from "lucide-react";
import { useState } from "react";
import { InfoModal } from "./InfoModal";
import { SupportTicketForm } from "./SupportTicketForm";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const [modalType, setModalType] = useState<string | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const { t } = useLanguage();

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
              {t('footer.tagline')}
            </p>
          </div>

          {/* Game */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.game')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('how-to-play')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.howToPlay')}</button></li>
              <li><button onClick={() => setModalType('game-rules')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.gameRules')}</button></li>
              <li><button onClick={() => setModalType('provably-fair')} className="hover:text-cyan-400 transition-colors text-left">{t('features.provablyFair')}</button></li>
              <li><a href="/leaderboard" className="hover:text-cyan-400 transition-colors">{t('nav.leaderboard')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('help-center')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.helpCenter')}</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">{t('footer.contactUs')}</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">{t('footer.bugReports')}</button></li>
              <li><button onClick={handleContactClick} className="hover:text-cyan-400 transition-colors text-left">{t('footer.feedback')}</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => setModalType('terms')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.terms')}</button></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.privacy')}</button></li>
              <li><button onClick={() => setModalType('responsible-gaming')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.responsibleGaming')}</button></li>
              <li><button onClick={() => setModalType('kyc')} className="hover:text-cyan-400 transition-colors text-left">{t('footer.kyc')}</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            {t('footer.rights')}
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

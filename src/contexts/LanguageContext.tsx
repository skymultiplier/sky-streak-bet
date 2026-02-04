import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.leaderboard': 'Leaderboard',
    'nav.history': 'History',
    'nav.gameLounge': 'Game Lounge',
    'nav.account': 'Account',
    'nav.login': 'Login / Sign Up',
    
    // Hero Section
    'hero.badge': 'Next-Gen Crypto Gaming',
    'hero.tagline': 'Navigate through multiplier zones, avoid the bombs, and cash out at the perfect moment. The ultimate aviation-themed crypto betting experience.',
    'hero.startFlying': 'Start Flying Now',
    'hero.playDemo': 'Play Demo',
    'hero.totalWinnings': 'Total Winnings',
    'hero.activePlayers': 'Active Players',
    'hero.uptime': 'Uptime',
    
    // Features
    'features.dynamicMultipliers': 'Dynamic Multipliers',
    'features.dynamicMultipliersDesc': 'Navigate through randomized multiplier zones ranging from 1.1x to 100x. Each flight is unique and unpredictable.',
    'features.provablyFair': 'Provably Fair',
    'features.provablyFairDesc': 'Transparent, blockchain-verified randomness ensures every game is fair. Verify results with cryptographic proof.',
    'features.instantPayouts': 'Instant Payouts',
    'features.instantPayoutsDesc': 'Lightning-fast crypto withdrawals. Cash out your winnings instantly to your wallet with minimal fees.',
    'features.experienceThrill': 'Experience the Thrill',
    'features.liveGameDemo': 'Live Game Demo',
    'features.clickToBegin': 'Click "Start Flying Now" to begin',
    
    // Footer
    'footer.tagline': 'The ultimate aviation-themed crypto betting experience. Navigate the skies and multiply your winnings.',
    'footer.game': 'Game',
    'footer.howToPlay': 'How to Play',
    'footer.gameRules': 'Game Rules',
    'footer.support': 'Support',
    'footer.helpCenter': 'Help Center',
    'footer.contactUs': 'Contact Us',
    'footer.bugReports': 'Bug Reports',
    'footer.feedback': 'Feedback',
    'footer.legal': 'Legal',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.responsibleGaming': 'Responsible Gaming',
    'footer.kyc': 'KYC Policy',
    'footer.rights': '© 2024 SkyMultiplier. All rights reserved.',
    
    // Auth
    'auth.demoCreated': 'Demo Account Created!',
    'auth.welcome': 'Welcome',
    'auth.demoBalance': 'You have 1,000 USDT to play with.',
    
    // Language
    'language.select': 'Language',
    'language.en': 'English',
    'language.fr': 'French',
    'language.es': 'Spanish',
  },
  fr: {
    // Navigation
    'nav.leaderboard': 'Classement',
    'nav.history': 'Historique',
    'nav.gameLounge': 'Salon de Jeu',
    'nav.account': 'Compte',
    'nav.login': 'Connexion / Inscription',
    
    // Hero Section
    'hero.badge': 'Jeu Crypto Nouvelle Génération',
    'hero.tagline': 'Naviguez à travers les zones de multiplicateurs, évitez les bombes et encaissez au moment parfait. L\'expérience ultime de paris crypto sur le thème de l\'aviation.',
    'hero.startFlying': 'Commencer à Voler',
    'hero.playDemo': 'Jouer en Démo',
    'hero.totalWinnings': 'Gains Totaux',
    'hero.activePlayers': 'Joueurs Actifs',
    'hero.uptime': 'Disponibilité',
    
    // Features
    'features.dynamicMultipliers': 'Multiplicateurs Dynamiques',
    'features.dynamicMultipliersDesc': 'Naviguez à travers des zones de multiplicateurs aléatoires allant de 1.1x à 100x. Chaque vol est unique et imprévisible.',
    'features.provablyFair': 'Équité Prouvable',
    'features.provablyFairDesc': 'La transparence et le hasard vérifié par blockchain garantissent que chaque jeu est équitable. Vérifiez les résultats avec une preuve cryptographique.',
    'features.instantPayouts': 'Paiements Instantanés',
    'features.instantPayoutsDesc': 'Retraits crypto ultra-rapides. Encaissez vos gains instantanément vers votre portefeuille avec des frais minimaux.',
    'features.experienceThrill': 'Vivez le Frisson',
    'features.liveGameDemo': 'Démo de Jeu en Direct',
    'features.clickToBegin': 'Cliquez sur "Commencer à Voler" pour commencer',
    
    // Footer
    'footer.tagline': 'L\'expérience ultime de paris crypto sur le thème de l\'aviation. Naviguez dans les cieux et multipliez vos gains.',
    'footer.game': 'Jeu',
    'footer.howToPlay': 'Comment Jouer',
    'footer.gameRules': 'Règles du Jeu',
    'footer.support': 'Support',
    'footer.helpCenter': 'Centre d\'Aide',
    'footer.contactUs': 'Nous Contacter',
    'footer.bugReports': 'Signaler un Bug',
    'footer.feedback': 'Retour',
    'footer.legal': 'Légal',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.responsibleGaming': 'Jeu Responsable',
    'footer.kyc': 'Politique KYC',
    'footer.rights': '© 2024 SkyMultiplier. Tous droits réservés.',
    
    // Auth
    'auth.demoCreated': 'Compte Démo Créé!',
    'auth.welcome': 'Bienvenue',
    'auth.demoBalance': 'Vous avez 1 000 USDT pour jouer.',
    
    // Language
    'language.select': 'Langue',
    'language.en': 'Anglais',
    'language.fr': 'Français',
    'language.es': 'Espagnol',
  },
  es: {
    // Navigation
    'nav.leaderboard': 'Clasificación',
    'nav.history': 'Historial',
    'nav.gameLounge': 'Sala de Juego',
    'nav.account': 'Cuenta',
    'nav.login': 'Iniciar Sesión / Registrarse',
    
    // Hero Section
    'hero.badge': 'Juego Cripto de Nueva Generación',
    'hero.tagline': 'Navega a través de las zonas de multiplicadores, evita las bombas y retira en el momento perfecto. La experiencia definitiva de apuestas cripto con temática de aviación.',
    'hero.startFlying': 'Comenzar a Volar',
    'hero.playDemo': 'Jugar Demo',
    'hero.totalWinnings': 'Ganancias Totales',
    'hero.activePlayers': 'Jugadores Activos',
    'hero.uptime': 'Disponibilidad',
    
    // Features
    'features.dynamicMultipliers': 'Multiplicadores Dinámicos',
    'features.dynamicMultipliersDesc': 'Navega a través de zonas de multiplicadores aleatorios que van desde 1.1x hasta 100x. Cada vuelo es único e impredecible.',
    'features.provablyFair': 'Justicia Demostrable',
    'features.provablyFairDesc': 'La aleatoriedad transparente y verificada por blockchain garantiza que cada juego sea justo. Verifica los resultados con prueba criptográfica.',
    'features.instantPayouts': 'Pagos Instantáneos',
    'features.instantPayoutsDesc': 'Retiros cripto ultrarrápidos. Retira tus ganancias instantáneamente a tu billetera con tarifas mínimas.',
    'features.experienceThrill': 'Experimenta la Emoción',
    'features.liveGameDemo': 'Demo del Juego en Vivo',
    'features.clickToBegin': 'Haz clic en "Comenzar a Volar" para empezar',
    
    // Footer
    'footer.tagline': 'La experiencia definitiva de apuestas cripto con temática de aviación. Navega por los cielos y multiplica tus ganancias.',
    'footer.game': 'Juego',
    'footer.howToPlay': 'Cómo Jugar',
    'footer.gameRules': 'Reglas del Juego',
    'footer.support': 'Soporte',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.contactUs': 'Contáctanos',
    'footer.bugReports': 'Reportar Errores',
    'footer.feedback': 'Comentarios',
    'footer.legal': 'Legal',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.responsibleGaming': 'Juego Responsable',
    'footer.kyc': 'Política KYC',
    'footer.rights': '© 2024 SkyMultiplier. Todos los derechos reservados.',
    
    // Auth
    'auth.demoCreated': '¡Cuenta Demo Creada!',
    'auth.welcome': 'Bienvenido',
    'auth.demoBalance': 'Tienes 1,000 USDT para jugar.',
    
    // Language
    'language.select': 'Idioma',
    'language.en': 'Inglés',
    'language.fr': 'Francés',
    'language.es': 'Español',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

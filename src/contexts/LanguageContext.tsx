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
    
    // Game Interface
    'game.demoUser': 'Demo User',
    'game.user': 'User',
    'game.demo': 'Demo',
    'game.real': 'Real',
    'game.replenish': 'Replenish',
    'game.flightControls': '✈️ Flight Controls',
    'game.betAmount': 'Bet Amount (USDT)',
    'game.minBet': 'Min: $10',
    'game.maxBet': 'Max Bet',
    'game.placeBet': '🚀 Place Bet & Fly!',
    'game.cashOut': '💰 Cash Out',
    'game.collectWinnings': '🎁 Collect Winnings',
    'game.gameStats': '📊 Game Stats',
    'game.currentBalance': 'Current Balance:',
    'game.lossStreak': 'Loss Streak:',
    'game.mode': 'Mode:',
    'game.realMoney': 'Real Money',
    'game.quickLinks': '🔗 Quick Links',
    'game.bettingHistory': '📈 Betting History',
    'game.leaderboard': '🏆 Leaderboard',
    'game.myAccount': '💳 My Account',
    'game.ready': 'Ready',
    'game.flying': 'Flying',
    'game.collect': 'Collect!',
    'game.crashed': 'Crashed',
    'game.bigWin': '🎉 BIG WIN! 🎉',
    'game.insufficientBalance': 'Insufficient Balance',
    'game.insufficientBalanceDesc': "You don't have enough funds to place this bet.",
    'game.insufficientDemoBalance': "You don't have enough demo funds to place this bet.",
    'game.betFailed': 'Bet Failed',
    'game.error': 'Error',
    'game.failedToPlaceBet': 'Failed to place bet. Please try again.',
    'game.noActiveBet': 'No active bet found.',
    'game.failedToResolveBet': 'Failed to resolve bet.',
    'game.congratulations': 'Congratulations!',
    'game.youWon': 'You won',
    'game.demoWin': 'Demo Win!',
    'game.demoWinDesc': 'You won {amount} in demo mode!',
    'game.demoReplenished': 'Demo Balance Replenished',
    'game.demoReplenishedDesc': 'Your demo account has been topped up with $1000 USDT!',
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
    
    // Game Interface
    'game.demoUser': 'Utilisateur Démo',
    'game.user': 'Utilisateur',
    'game.demo': 'Démo',
    'game.real': 'Réel',
    'game.replenish': 'Recharger',
    'game.flightControls': '✈️ Commandes de Vol',
    'game.betAmount': 'Montant du Pari (USDT)',
    'game.minBet': 'Min: 10$',
    'game.maxBet': 'Mise Maximum',
    'game.placeBet': '🚀 Parier & Voler!',
    'game.cashOut': '💰 Encaisser',
    'game.collectWinnings': '🎁 Collecter les Gains',
    'game.gameStats': '📊 Statistiques',
    'game.currentBalance': 'Solde Actuel:',
    'game.lossStreak': 'Série de Pertes:',
    'game.mode': 'Mode:',
    'game.realMoney': 'Argent Réel',
    'game.quickLinks': '🔗 Liens Rapides',
    'game.bettingHistory': '📈 Historique des Paris',
    'game.leaderboard': '🏆 Classement',
    'game.myAccount': '💳 Mon Compte',
    'game.ready': 'Prêt',
    'game.flying': 'En Vol',
    'game.collect': 'Collecter!',
    'game.crashed': 'Crashé',
    'game.bigWin': '🎉 GROS GAIN! 🎉',
    'game.insufficientBalance': 'Solde Insuffisant',
    'game.insufficientBalanceDesc': "Vous n'avez pas assez de fonds pour ce pari.",
    'game.insufficientDemoBalance': "Vous n'avez pas assez de fonds démo pour ce pari.",
    'game.betFailed': 'Pari Échoué',
    'game.error': 'Erreur',
    'game.failedToPlaceBet': 'Échec du pari. Veuillez réessayer.',
    'game.noActiveBet': 'Aucun pari actif trouvé.',
    'game.failedToResolveBet': 'Échec de la résolution du pari.',
    'game.congratulations': 'Félicitations!',
    'game.youWon': 'Vous avez gagné',
    'game.demoWin': 'Gain Démo!',
    'game.demoWinDesc': 'Vous avez gagné {amount} en mode démo!',
    'game.demoReplenished': 'Solde Démo Rechargé',
    'game.demoReplenishedDesc': 'Votre compte démo a été rechargé avec 1000$ USDT!',
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
    
    // Game Interface
    'game.demoUser': 'Usuario Demo',
    'game.user': 'Usuario',
    'game.demo': 'Demo',
    'game.real': 'Real',
    'game.replenish': 'Recargar',
    'game.flightControls': '✈️ Controles de Vuelo',
    'game.betAmount': 'Monto de Apuesta (USDT)',
    'game.minBet': 'Mín: $10',
    'game.maxBet': 'Apuesta Máxima',
    'game.placeBet': '🚀 ¡Apostar y Volar!',
    'game.cashOut': '💰 Cobrar',
    'game.collectWinnings': '🎁 Recoger Ganancias',
    'game.gameStats': '📊 Estadísticas',
    'game.currentBalance': 'Saldo Actual:',
    'game.lossStreak': 'Racha de Pérdidas:',
    'game.mode': 'Modo:',
    'game.realMoney': 'Dinero Real',
    'game.quickLinks': '🔗 Enlaces Rápidos',
    'game.bettingHistory': '📈 Historial de Apuestas',
    'game.leaderboard': '🏆 Clasificación',
    'game.myAccount': '💳 Mi Cuenta',
    'game.ready': 'Listo',
    'game.flying': 'Volando',
    'game.collect': '¡Cobrar!',
    'game.crashed': 'Estrellado',
    'game.bigWin': '🎉 ¡GRAN VICTORIA! 🎉',
    'game.insufficientBalance': 'Saldo Insuficiente',
    'game.insufficientBalanceDesc': 'No tienes suficientes fondos para esta apuesta.',
    'game.insufficientDemoBalance': 'No tienes suficientes fondos demo para esta apuesta.',
    'game.betFailed': 'Apuesta Fallida',
    'game.error': 'Error',
    'game.failedToPlaceBet': 'Error al apostar. Por favor, inténtalo de nuevo.',
    'game.noActiveBet': 'No se encontró apuesta activa.',
    'game.failedToResolveBet': 'Error al resolver la apuesta.',
    'game.congratulations': '¡Felicidades!',
    'game.youWon': 'Ganaste',
    'game.demoWin': '¡Victoria Demo!',
    'game.demoWinDesc': '¡Ganaste {amount} en modo demo!',
    'game.demoReplenished': 'Saldo Demo Recargado',
    'game.demoReplenishedDesc': '¡Tu cuenta demo ha sido recargada con $1000 USDT!',
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

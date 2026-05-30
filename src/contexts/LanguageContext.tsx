import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { enTranslations } from '@/i18n/en';
import { frTranslations } from '@/i18n/fr';
import { esTranslations } from '@/i18n/es';
import { roTranslations } from '@/i18n/ro';
import { itTranslations } from '@/i18n/it';
import { ptTranslations } from '@/i18n/pt';

export type Language = 'en' | 'fr' | 'es' | 'ro' | 'it' | 'pt';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'es', 'ro', 'it', 'pt'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
  ro: roTranslations,
  it: itTranslations,
  pt: ptTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getLangFromPath = (pathname: string): Language | null => {
  const seg = pathname.split('/')[1] as Language;
  return SUPPORTED_LANGUAGES.includes(seg) ? seg : null;
};

const stripLangFromPath = (pathname: string): string => {
  const seg = pathname.split('/')[1] as Language;
  if (SUPPORTED_LANGUAGES.includes(seg)) {
    return '/' + pathname.split('/').slice(2).join('/');
  }
  return pathname;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [language, setLanguageState] = useState<Language>(() => {
    const fromPath = getLangFromPath(window.location.pathname);
    if (fromPath) return fromPath;
    const saved = localStorage.getItem('language') as Language;
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
  });

  // Sync language whenever URL changes
  useEffect(() => {
    const fromPath = getLangFromPath(location.pathname);
    if (fromPath && fromPath !== language) {
      setLanguageState(fromPath);
      localStorage.setItem('language', fromPath);
    }
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update URL to reflect language
    const rest = stripLangFromPath(location.pathname);
    const newPath = `/${lang}${rest === '/' ? '' : rest}`;
    navigate(newPath + location.search + location.hash, { replace: true });
  };

  const t = (key: string): string => translations[language][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

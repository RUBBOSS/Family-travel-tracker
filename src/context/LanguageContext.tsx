'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { LANG_STORAGE_KEY, translate, type Lang } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key with optional {var} interpolation; plurals via vars.n. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'ru' || stored === 'hy') return stored;
    const nav = window.navigator.language?.toLowerCase() ?? '';
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('hy')) return 'hy';
  } catch {
    // localStorage unavailable — default to English
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Restore persisted/browser language after mount (SSR-safe)
  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  // Keep <html lang> in sync for screen readers and hyphenation
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

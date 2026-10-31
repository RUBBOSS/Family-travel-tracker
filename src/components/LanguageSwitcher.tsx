'use client';

import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES, type Lang } from '@/lib/i18n';
import { motion } from 'framer-motion';

/** Compact EN/РУ/ՀԱ pill switcher. `variant="ghost"` fits dark headers. */
export function LanguageSwitcher({ variant = 'ghost' }: { variant?: 'ghost' | 'plain' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('lang.aria')}
      className={`inline-flex items-center gap-0.5 rounded-lg border p-0.5 ${
        variant === 'ghost'
          ? 'border-white/10 bg-slate-950/50'
          : 'border-white/10 bg-white/5'
      }`}
    >
      {LANGUAGES.map(({ code, short, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code as Lang)}
            aria-pressed={active}
            title={label}
            className={`relative rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
              active ? 'text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-md bg-teal-400"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">{short}</span>
          </button>
        );
      })}
    </div>
  );
}

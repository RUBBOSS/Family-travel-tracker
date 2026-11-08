'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Globe2, Loader2, Users } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { fadeUp } from '@/lib/motion';

export default function AuthForm() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        if (!username.trim()) {
          setError(t('auth.errorUsername'));
          setLoading(false);
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: username.trim(),
            },
          },
        });
        if (signUpError) throw signUpError;
      }
      // Full reload lets UserContext pick up the new session cleanly.
      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AuroraBackground />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md lg:grid-cols-[1.1fr_1fr]">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-500/15 via-slate-900/10 to-violet-500/15 p-10 lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/20 text-teal-300 ring-1 ring-teal-400/30">
              <Globe2 className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">{t('tracker.appTitle')}</span>
          </div>

          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}>
            <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold leading-tight tracking-tight text-white">
              {t('auth.panelTitle')}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              {t('auth.panelText')}
            </motion.p>

            <motion.ul variants={fadeUp} className="mt-8 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <Compass className="h-4 w-4 text-teal-300" /> {t('auth.bullet1')}
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-4 w-4 text-violet-300" /> {t('auth.bullet2')}
              </li>
            </motion.ul>
          </motion.div>

          <p className="text-xs text-slate-500">{t('auth.panelFooter')}</p>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher variant="plain" />
          </div>

          {/* Mode switch */}
          <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-slate-950/50 p-1" role="tablist">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`relative rounded-lg py-2 text-sm font-medium transition-colors ${mode === m ? 'text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-mode-pill"
                    className="absolute inset-0 rounded-lg bg-teal-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{m === 'login' ? t('auth.tabSignIn') : t('auth.tabCreate')}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12, transition: { duration: 0.15 } }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === 'register' && (
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-300">{t('auth.username')}</label>
                  <input
                    id="username"
                    type="text"
                    placeholder={t('auth.usernamePlaceholder')}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input-primary"
                    autoComplete="username"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-primary"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">{t('auth.password')}</label>
                <input
                  id="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-primary"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? t('auth.btnSignIn') : t('auth.btnCreate')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-400">
                {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-medium text-teal-300 underline-offset-4 hover:underline"
                >
                  {mode === 'login' ? t('auth.switchToRegisterLink') : t('auth.switchToLoginLink')}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { useLanguage } from '@/context/LanguageContext';

const STORAGE_KEY = 'ftt-license-key';

/**
 * License gate shown on /app when Whop licensing is enabled for this
 * deployment and no valid key is stored. Dormant while WHOP_* env vars
 * are unset (staged mode).
 */
export default function LicenseGate({ checkoutUrl }: { checkoutUrl: string | null }) {
  const { t } = useLanguage();
  const [licenseKey, setLicenseKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim() || checking) return;
    setChecking(true);
    setError(null);

    try {
      const res = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        try {
          window.localStorage.setItem(STORAGE_KEY, licenseKey.trim());
        } catch {
          // storage unavailable — the in-memory session still works
        }
        window.location.reload();
        return;
      }

      setError(
        data.error === 'invalid_key'
          ? 'That license key was not recognized. Check it and try again.'
          : 'License check failed — please try again in a moment.'
      );
    } catch {
      setError('License check failed — please try again in a moment.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
          <KeyRound className="h-6 w-6" />
        </span>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
          Activate your license
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Paste the license key from your Whop purchase confirmation to unlock the app on this device.
        </p>

        <form onSubmit={handleActivate} className="mt-6 space-y-4">
          <input
            type="text"
            value={licenseKey}
            onChange={e => setLicenseKey(e.target.value)}
            placeholder="WHOP-XXXX-XXXX-XXXX"
            className="input-primary py-2.5 font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />

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

          <button type="submit" disabled={checking || !licenseKey.trim()} className="btn-primary w-full py-2.5">
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Activate
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-sm text-slate-400">
          <p>No license yet?</p>
          {checkoutUrl ? (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 w-full py-2.5">
              Get a license on Whop
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link href="/pricing" className="btn-secondary mt-3 w-full py-2.5">
              See plans & pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </main>
  );
}

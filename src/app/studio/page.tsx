'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Check, Copy, Globe2, Image as ImageIcon, Loader2, Palette } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { useUserContext } from '@/context/UserContext';
import { supabase } from '@/utils/supabaseClient';
import { fadeUp, staggerContainer } from '@/lib/motion';

const BRAND_COLORS = ['#2dd4bf', '#14b8a6', '#0ea5e9', '#6366f1', '#a78bfa', '#f97316', '#ef4444', '#ec4899'];

export default function AgencyStudio() {
  const { t } = useLanguage();
  const { currentUser, setCurrentUser, isLoading } = useUserContext();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState('#2dd4bf');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.agency_name ?? currentUser.full_name ?? '');
      setLogoUrl(currentUser.agency_logo_url ?? '');
      setColor(currentUser.agency_color ?? '#2dd4bf');
    }
  }, [currentUser]);

  const logoOk = useMemo(() => {
    if (!logoUrl.trim()) return true; // empty = no logo
    return /^https?:\/\//i.test(logoUrl.trim());
  }, [logoUrl]);

  const previewColor = color || currentUser?.avatar_color || '#2dd4bf';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !currentUser) return;
    setSaving(true);
    setSaved(false);

    const branding = {
      agency_name: name.trim(),
      agency_logo_url: logoUrl.trim(),
      agency_color: previewColor,
    };

    try {
      // 1) Always works: auth user metadata
      const { error: metaError } = await supabase.auth.updateUser({ data: branding });
      if (metaError) throw metaError;

      // 2) Best-effort mirror into user_profiles (migration-3 columns).
      //    Fails silently pre-migration; metadata still drives the UI.
      await supabase
        .from('user_profiles')
        .update({
          agency_name: branding.agency_name,
          agency_logo_url: branding.agency_logo_url,
          agency_color: branding.agency_color,
        })
        .eq('id', currentUser.id);

      setCurrentUser({ ...currentUser, ...branding });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save branding:', err);
    } finally {
      setSaving(false);
    }
  };

  const copySignupLink = async () => {
    const url = `${window.location.origin}/app`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (isLoading) return null;
  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Link href="/app" className="btn-primary">{t('common.signIn')}</Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pb-20">
      <AuroraBackground intensity="subtle" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between py-3">
          <Link href="/app" className="btn-ghost">
            <ArrowLeft size={15} /> {t('studio.back')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <motion.section
        className="mx-auto max-w-3xl px-4 pt-10 sm:px-6"
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
              <Building2 className="h-6 w-6" />
            </span>
            {t('studio.title')}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{t('studio.subtitle')}</p>
        </motion.div>

        {/* Branding form */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSave}
          className="surface-card mt-8 space-y-6 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="agency-name" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Globe2 className="h-4 w-4 text-teal-300" /> {t('studio.nameLabel')}
            </label>
            <input
              id="agency-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('studio.namePlaceholder')}
              className="input-primary"
              maxLength={60}
            />
            <p className="mt-1.5 text-xs text-slate-500">{t('studio.nameHint')}</p>
          </div>

          <div>
            <label htmlFor="agency-logo" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <ImageIcon className="h-4 w-4 text-teal-300" /> {t('studio.logoLabel')}
            </label>
            <input
              id="agency-logo"
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://your-site.com/logo.png"
              className={`input-primary ${logoUrl && !logoOk ? 'border-red-500/50' : ''}`}
            />
            <p className="mt-1.5 text-xs text-slate-500">{t('studio.logoHint')}</p>
            {logoUrl && !logoOk && (
              <p className="mt-1 text-xs text-red-300">{t('studio.logoInvalid')}</p>
            )}
          </div>

          <div>
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Palette className="h-4 w-4 text-teal-300" /> {t('studio.colorLabel')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {BRAND_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  aria-label={c}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label={t('studio.colorCustom')}
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">{t('studio.preview')}</p>
            <div className="flex items-center gap-3">
              {logoUrl.trim() && logoOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl object-contain ring-1 ring-white/10" />
              ) : (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-teal-100"
                  style={{ backgroundColor: previewColor }}
                >
                  <Globe2 className="h-5 w-5" />
                </span>
              )}
              <div>
                <p className="font-display text-sm font-semibold text-white">
                  {name.trim() || t('studio.previewNameFallback')}
                </p>
                <p className="text-xs" style={{ color: previewColor }}>
                  {t('studio.previewTagline')}
                </p>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={saving || !logoOk}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved ? t('studio.saved') : t('studio.save')}
          </button>
        </motion.form>

        {/* Client onboarding */}
        <motion.div variants={fadeUp} className="surface-card mt-8 p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-white">{t('studio.onboardTitle')}</h2>
          <ol className="mt-4 space-y-3">
            {['studio.onboardStep1', 'studio.onboardStep2', 'studio.onboardStep3', 'studio.onboardStep4'].map((key, i) => (
              <li key={key} className="flex gap-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-xs font-bold text-teal-300">
                  {i + 1}
                </span>
                {t(key)}
              </li>
            ))}
          </ol>
          <button type="button" onClick={copySignupLink} className="btn-secondary mt-5">
            {copied ? <Check className="h-4 w-4 text-teal-300" /> : <Copy className="h-4 w-4" />}
            {copied ? t('studio.copied') : t('studio.copyLink')}
          </button>
        </motion.div>
      </motion.section>
    </main>
  );
}

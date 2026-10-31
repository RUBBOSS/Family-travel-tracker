'use client';

import { useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';

interface AddFamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
  addFamilyMember?: (name: string, avatarColor: string) => Promise<any>;
}

const AVATAR_COLORS = [
  '#FF6B6B', '#FF9F43', '#FFD93D', '#6BCB77', '#4ECDC4',
  '#54A0FF', '#A78BFA', '#F368E0', '#FF8FA3', '#38BDF8',
  '#34D399', '#F59E0B', '#FB7185', '#818CF8', '#2DD4BF',
];

export default function AddFamilyMemberDialog({ isOpen, onClose, onMemberAdded, addFamilyMember }: AddFamilyMemberDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalColor = useCustomColor && customColor ? customColor : selectedColor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('members.errorName'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (addFamilyMember) {
        await addFamilyMember(name.trim(), finalColor);
      } else {
        // Fallback path: call the API directly with the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error('Authentication error: ' + sessionError.message);

        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error('Your session expired — please sign in again.');

        const response = await fetch('/api/family-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: name.trim(), avatarColor: finalColor }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add family member');
        }
      }

      // Reset + close
      setName('');
      setSelectedColor(AVATAR_COLORS[0]);
      setCustomColor('');
      setUseCustomColor(false);
      onMemberAdded?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('members.dialogTitle'));
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('members.dialogTitle')}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)]"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } }}
            exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-teal-400/30">
                  <UserPlus className="h-4.5 w-4.5" />
                </span>
                {t('members.dialogTitle')}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="memberName" className="mb-1.5 block text-sm font-medium text-slate-300">
                  {t('members.nameLabel')}
                </label>
                <input
                  id="memberName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('members.namePlaceholder')}
                  className="input-primary"
                  autoFocus
                  maxLength={100}
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-300">{t('members.colorLabel')}</span>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setUseCustomColor(false);
                      }}
                      aria-pressed={selectedColor === color && !useCustomColor}
                      aria-label={`Color ${color}`}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        selectedColor === color && !useCustomColor
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                  <input
                    type="color"
                    value={customColor || '#FF6B6B'}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setUseCustomColor(true);
                    }}
                    className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label={t('members.customColor')}
                  />
                  <span className="text-sm text-slate-300">{t('members.customColor')}</span>
                  {useCustomColor && (
                    <span
                      className="ml-auto h-4 w-4 rounded-full ring-1 ring-white/40"
                      style={{ backgroundColor: customColor }}
                    />
                  )}
                </label>
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

              {/* Live preview */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-950"
                  style={{ backgroundColor: finalColor }}
                >
                  {(name.trim() || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{name.trim() || t('members.preview')}</p>
                  <p className="text-xs text-slate-500">{name.trim() ? t('members.previewHint', { name: name.trim() }) : t('members.previewHintEmpty')}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading || !name.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('members.add')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

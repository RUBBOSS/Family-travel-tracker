'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  memberName?: string;
}

const TYPE_STYLES = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-300',
    iconBg: 'bg-red-500/15 ring-red-500/30',
    confirmButton: 'bg-red-500 hover:bg-red-400 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-300',
    iconBg: 'bg-amber-500/15 ring-amber-500/30',
    confirmButton: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
  },
  info: {
    icon: Info,
    iconColor: 'text-teal-300',
    iconBg: 'bg-teal-500/15 ring-teal-500/30',
    confirmButton: 'bg-teal-400 hover:bg-teal-300 text-slate-950',
  },
} as const;

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  memberName,
}: ConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // ESC to close, body scroll lock, focus the confirm button
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const styles = TYPE_STYLES[type];
  const Icon = styles.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label={title}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.9)]"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } }}
              exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${styles.iconBg} ${styles.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{message}</p>
                  </div>
                </div>

                {memberName && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                      {memberName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{memberName}</p>
                      <p className="text-xs text-slate-500">Family member</p>
                    </div>
                  </div>
                )}

                {type === 'danger' && (
                  <p className="mt-4 text-xs text-slate-500">
                    This action cannot be undone. All associated travel data will be permanently deleted.
                  </p>
                )}
              </div>

              <div className="flex gap-3 border-t border-white/10 px-6 py-4">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  {cancelText}
                </button>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${styles.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

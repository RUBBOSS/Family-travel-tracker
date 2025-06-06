'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

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

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  memberName
}: ConfirmationDialogProps) {  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = originalStyle;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-400',
          iconBg: 'bg-red-500/10',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          ring: 'ring-red-500/20'
        };
      case 'warning':
        return {
          iconColor: 'text-amber-400',
          iconBg: 'bg-amber-500/10',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
          ring: 'ring-amber-500/20'
        };
      default:
        return {
          iconColor: 'text-blue-400',
          iconBg: 'bg-blue-500/10',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          ring: 'ring-blue-500/20'
        };
    }
  };
  const styles = getTypeStyles();

  const dialogContent = (
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 overflow-y-auto">
        <div 
          className={`relative transform overflow-hidden rounded-xl bg-slate-800 shadow-2xl transition-all w-full max-w-md border border-slate-700 ${styles.ring} ring-1 my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 pb-4">
            {/* Icon */}
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
              <AlertTriangle className={`h-8 w-8 ${styles.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-white text-center mb-3">
              {title}
            </h3>

            {/* Member info if provided */}
            {memberName && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{memberName}</p>
                    <p className="text-slate-400 text-sm">Family Member</p>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <p className="text-slate-300 text-center leading-relaxed mb-6">
              {message}
            </p>

            {/* Warning box */}
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium">Warning</p>
                  <p className="text-amber-300">This action cannot be undone. All associated travel data will be permanently deleted.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-700/30 px-6 py-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-transparent border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 ${styles.confirmButton}`}
            >
              {confirmText}
            </button>          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document.body level for proper z-index stacking
  return typeof window !== 'undefined' 
    ? createPortal(dialogContent, document.body)
    : null;
}

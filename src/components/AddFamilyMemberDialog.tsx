'use client';

import { useState } from 'react';
import { X, User, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddFamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
  addFamilyMember?: (name: string, avatarColor: string) => Promise<any>;
}

const AVATAR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#8B5FBF', '#EAB308', '#22C55E'
];

export default function AddFamilyMemberDialog({ isOpen, onClose, onMemberAdded, addFamilyMember }: AddFamilyMemberDialogProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for the family member');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the passed addFamilyMember function if available, otherwise fall back to direct API call
      if (addFamilyMember) {
        await addFamilyMember(name.trim(), selectedColor);
      } else {
        const response = await fetch('/api/family-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            avatarColor: selectedColor,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add family member');
        }
      }

      // Reset form
      setName('');
      setSelectedColor(AVATAR_COLORS[0]);
      setError(null);
      
      // Notify parent component
      if (onMemberAdded) {
        onMemberAdded();
      }
      
      onClose();
    } catch (err) {
      console.error('Error adding family member:', err);
      setError(err instanceof Error ? err.message : 'Failed to add family member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <div 
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Add Family Member
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="memberName" className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    id="memberName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter family member's name"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Palette className="w-4 h-4" />
                    Avatar Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-white scale-110'
                            : 'border-slate-600 hover:border-slate-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

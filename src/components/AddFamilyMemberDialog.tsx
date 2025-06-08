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
  '#FF3B30', // Bright Red
  '#FF9500', // Bright Orange
  '#FFCC00', // Bright Yellow
  '#30D158', // Bright Green
  '#00C7BE', // Bright Teal
  '#007AFF', // Bright Blue
  '#5856D6', // Bright Purple
  '#FF2D92', // Bright Pink
  '#FF6B35', // Bright Coral
  '#34C759', // Bright Lime
  '#64D2FF', // Bright Cyan
  '#BF5AF2', // Bright Violet
  '#FF3B7D', // Bright Magenta
  '#32D74B', // Bright Mint
  '#5AC8FA'  // Bright Sky Blue
];

export default function AddFamilyMemberDialog({ isOpen, onClose, onMemberAdded, addFamilyMember }: AddFamilyMemberDialogProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name for the family member');
      return;
    }

    console.log('AddFamilyMemberDialog: Setting loading to true');
    setLoading(true);
    setError(null);

    try {
      console.log('AddFamilyMemberDialog: Starting to add family member', { name: name.trim() });
      
      // Use the passed addFamilyMember function if available, otherwise fall back to direct API call
      const finalColor = useCustomColor ? customColor : selectedColor;
      
      if (addFamilyMember) {
        console.log('AddFamilyMemberDialog: Using hook addFamilyMember function');
        await addFamilyMember(name.trim(), finalColor);
        console.log('AddFamilyMemberDialog: Hook function completed successfully');      } else {        console.log('AddFamilyMemberDialog: Using fallback direct API call - addFamilyMember not available');
        
        // Get auth token for direct API call
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        console.log('AddFamilyMemberDialog: Getting session for fallback API call');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AddFamilyMemberDialog: Session error in fallback:', sessionError);
          throw new Error('Authentication error: ' + sessionError.message);
        }
        
        const accessToken = sessionData.session?.access_token;
        
        if (!accessToken) {
          console.error('AddFamilyMemberDialog: No access token in fallback');
          throw new Error('Authentication error - no access token');
        }
        
        console.log('AddFamilyMemberDialog: Making fallback API request with token');
        const response = await fetch('/api/family-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: name.trim(),
            avatarColor: finalColor,
          }),
        });

        console.log('AddFamilyMemberDialog: Fallback API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('AddFamilyMemberDialog: Fallback API error:', errorData);
          throw new Error(errorData.error || 'Failed to add family member');
        }
        
        const responseData = await response.json();
        console.log('AddFamilyMemberDialog: Fallback API call completed successfully', responseData);
      }

      // Reset form
      console.log('AddFamilyMemberDialog: Resetting form');
      setName('');
      setSelectedColor(AVATAR_COLORS[0]);
      setCustomColor('');
      setUseCustomColor(false);
      setError(null);
      
      // Notify parent component - wrap in try-catch to prevent errors from breaking flow
      if (onMemberAdded) {
        try {
          console.log('AddFamilyMemberDialog: Calling onMemberAdded callback');
          onMemberAdded();
        } catch (callbackError) {
          console.error('AddFamilyMemberDialog: Error in onMemberAdded callback:', callbackError);
        }
      }
      
      // Close dialog - wrap in try-catch to prevent errors from breaking flow
      try {
        console.log('AddFamilyMemberDialog: Closing dialog');
        onClose();
      } catch (closeError) {
        console.error('AddFamilyMemberDialog: Error closing dialog:', closeError);
      }
    } catch (err) {
      console.error('AddFamilyMemberDialog: Error adding family member:', err);
      setError(err instanceof Error ? err.message : 'Failed to add family member');
    } finally {
      console.log('AddFamilyMemberDialog: Setting loading to false in finally block');
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
                </div>                {/* Color Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                    <Palette className="w-4 h-4" />
                    Avatar Color
                  </label>
                  
                  {/* Preset Colors */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          setUseCustomColor(false);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color && !useCustomColor
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-600 hover:border-slate-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg border border-slate-600">
                    <input
                      type="color"
                      value={customColor || '#FF3B30'}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setUseCustomColor(true);
                      }}
                      className="w-8 h-8 rounded border-2 border-slate-500 cursor-pointer"
                      title="Choose custom color"
                    />
                    <span className="text-sm text-slate-300">Custom Color</span>
                    {useCustomColor && (
                      <div 
                        className="w-4 h-4 rounded-full border border-white ml-auto"
                        style={{ backgroundColor: customColor }}
                      />
                    )}
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

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserContext } from '@/context/UserContext';
import { FamilyMemberWithMeta } from '@/hooks/useFamilyMembers';
import { X, Users } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

interface FamilyMemberTabsProps {
  familyMembers: FamilyMemberWithMeta[];
  loading: boolean;
  selectedMemberId: number | null;
  onDeleteMember: (id: number) => Promise<void>;
  onMemberSelect: (memberId: number | null) => void;
  /** Renders an "Everyone" chip in front (for the all-members map view). */
  showAllChip?: boolean;
  allSelected?: boolean;
  onSelectAll?: () => void;
}

export default function FamilyMemberTabs({ familyMembers, loading, selectedMemberId, onDeleteMember, onMemberSelect, showAllChip = false, allSelected = false, onSelectAll }: FamilyMemberTabsProps) {
  const { currentUser } = useUserContext();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    memberId: number | null;
    memberName: string;
  }>({
    isOpen: false,
    memberId: null,
    memberName: ''
  });

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3" aria-busy="true">
        <div className="h-14 w-36 animate-shimmer rounded-2xl" />
        <div className="h-14 w-36 animate-shimmer rounded-2xl" />
        <div className="h-14 w-36 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  const handleDeleteMember = (memberId: number, memberName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, memberId, memberName });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.memberId) return;

    try {
      await onDeleteMember(confirmDialog.memberId);
      if (selectedMemberId === confirmDialog.memberId) {
        onMemberSelect(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setConfirmDialog({ isOpen: false, memberId: null, memberName: '' });
      // Toast-level feedback lives in the hook; keep dialog closed either way.
      window.alert(`Couldn't remove ${confirmDialog.memberName}. Please try again.`);
      return;
    }
    setConfirmDialog({ isOpen: false, memberId: null, memberName: '' });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ isOpen: false, memberId: null, memberName: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Everyone chip */}
        {showAllChip && (
          <motion.button
            layout
            type="button"
            onClick={() => onSelectAll?.()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-pressed={allSelected}
            className="relative flex items-center space-x-3 rounded-2xl border border-teal-400/40 bg-teal-400/15 px-4 py-3 text-left"
            style={{
              boxShadow: allSelected ? '0 0 0 2px #020617, 0 0 0 4px #2dd4bf' : 'none',
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400/25 text-teal-300">
              <Users className="h-4 w-4" />
            </span>
            <span className="font-semibold text-teal-100">Everyone</span>
          </motion.button>
        )}

        {/* Account owner chip */}
        <motion.button
          layout
          type="button"
          onClick={() => onMemberSelect(null)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-pressed={selectedMemberId === null}
          className="relative flex items-center space-x-3 rounded-2xl px-4 py-3 text-left transition-shadow"
          style={{
            backgroundColor: currentUser.avatar_color,
            color: '#0f172a',
            boxShadow: selectedMemberId === null
              ? `0 0 0 2px #020617, 0 0 0 4px ${currentUser.avatar_color}`
              : 'none',
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 font-bold">
            {currentUser.username?.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold">{currentUser.username} (you)</span>
        </motion.button>

        {/* Family member chips */}
        <AnimatePresence initial={false}>
          {familyMembers.map((member) => (
            <motion.button
              layout
              key={member.id}
              type="button"
              onClick={() => onMemberSelect(member.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              aria-pressed={selectedMemberId === member.id}
              className="group relative flex items-center space-x-3 rounded-2xl px-4 py-3 text-left"
              style={{
                backgroundColor: member.avatarColor || '#8b5cf6',
                color: '#0f172a',
                boxShadow: selectedMemberId === member.id
                  ? `0 0 0 2px #020617, 0 0 0 4px ${member.avatarColor || '#8b5cf6'}`
                  : 'none',
              }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 font-bold">
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-semibold">{member.name}</span>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${member.name}`}
                onClick={(e) => handleDeleteMember(member.id, member.name, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    handleDeleteMember(member.id, member.name, e as unknown as React.MouseEvent);
                  }
                }}
                className="ml-1 rounded-full bg-black/15 p-1 opacity-0 transition-opacity hover:bg-black/25 focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {familyMembers.length === 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/15 px-5 py-4">
          <Users className="h-8 w-8 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-300">No family members yet</p>
            <p className="text-sm text-slate-500">Add one to start coloring the map together.</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Remove Family Member"
        message="Are you sure you want to remove this family member? This will permanently delete all their travel data and visited countries."
        confirmText="Remove Member"
        cancelText="Keep Member"
        type="danger"
        memberName={confirmDialog.memberName}
      />
    </div>
  );
}

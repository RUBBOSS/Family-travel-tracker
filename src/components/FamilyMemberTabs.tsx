'use client';

import { useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { FamilyMemberWithMeta } from '@/hooks/useFamilyMembers';
import { X, User } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

interface FamilyMemberTabsProps {
  familyMembers: FamilyMemberWithMeta[];
  loading: boolean;
  selectedMemberId: number | null;
  onDeleteMember: (id: number) => Promise<void>;
  onMemberSelect: (memberId: number | null) => void;
}

export default function FamilyMemberTabs({ familyMembers, loading, selectedMemberId, onDeleteMember, onMemberSelect }: FamilyMemberTabsProps) {
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

  if (!currentUser) {
    return (
      <div className="text-center py-6 rounded-lg bg-slate-700/50">
        <p className="text-slate-300">No user logged in</p>
        <p className="text-slate-400 text-sm mt-2">Please log in to get started</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-6 rounded-lg bg-slate-700/50">
        <p className="text-slate-300">Loading family members...</p>
      </div>
    );
  }  const handleDeleteMember = async (memberId: number, memberName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setConfirmDialog({
      isOpen: true,
      memberId,
      memberName
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.memberId) return;
    
    try {
      console.log('Component: Starting delete for member ID:', confirmDialog.memberId);
      await onDeleteMember(confirmDialog.memberId);
      
      console.log('Component: Delete successful, updating selected member');
      if (selectedMemberId === confirmDialog.memberId) {
        onMemberSelect(null);
      }
      
      console.log('Component: Delete operation completed');
    } catch (error) {
      console.error('Component: Delete failed:', error);
      alert(`Failed to delete family member: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      isOpen: false,
      memberId: null,
      memberName: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Account Owner */}
      <div className="flex flex-wrap gap-3">        <div 
          className="relative group cursor-pointer focus:outline-none"
          onClick={() => onMemberSelect(null)}
        >
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 shadow-xl hover:scale-105 focus:outline-none ${
              selectedMemberId === null ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{ backgroundColor: currentUser.avatar_color, color: 'white' }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{currentUser.username} (You)</span>
          </div>
        </div>        {/* Family Members */}        {familyMembers.map((member) => (
          <div 
            key={member.id}
            className="relative group cursor-pointer focus:outline-none"
            onClick={() => onMemberSelect(member.id)}
          >
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 shadow-xl hover:scale-105 focus:outline-none ${
                selectedMemberId === member.id ? 'ring-2 ring-blue-400' : ''
              }`}
              style={{ backgroundColor: member.avatarColor || '#8b5cf6', color: 'white' }}
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{member.name}</span>
                {/* Delete button - only visible on hover */}
              <button
                onClick={(e) => handleDeleteMember(member.id, member.name, e)}
                className="ml-2 p-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
                title="Remove family member"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No family members message */}
      {familyMembers.length === 0 && (
        <div className="text-center py-4 border-2 border-dashed border-slate-600 rounded-lg">
          <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No family members added yet</p>
          <p className="text-slate-500 text-xs">Click &quot;Add Member&quot; to get started</p>
        </div>
      )}      {/* Selected member info */}
      {selectedMemberId && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <h3 className="text-white font-medium mb-2">Currently viewing travels for:</h3>
          {(() => {
            const selectedMember = familyMembers.find(m => m.id === selectedMemberId);
            if (!selectedMember) return null;
            
            return (
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: selectedMember.avatarColor || '#8b5cf6' }}
                >
                  {selectedMember.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300">{selectedMember.name}</span>
              </div>
            );          })()}
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

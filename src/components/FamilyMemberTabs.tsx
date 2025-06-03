'use client';

import { useState } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useFamilyMembers, FamilyMemberWithMeta } from '@/hooks/useFamilyMembers';
import { X, User } from 'lucide-react';

export default function FamilyMemberTabs() {
  const { currentUser } = useUserContext();
  const { familyMembers, loading, deleteFamilyMember } = useFamilyMembers();
  const [selectedMember, setSelectedMember] = useState<FamilyMemberWithMeta | null>(null);

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
  }

  const handleDeleteMember = async (memberId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to remove this family member? This will also remove all their visited countries.')) {
      try {
        await deleteFamilyMember(memberId);
        if (selectedMember?.id === memberId) {
          setSelectedMember(null);
        }
      } catch (error) {
        alert('Failed to delete family member. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Account Owner */}
      <div className="flex flex-wrap gap-3">
        <div 
          className={`relative group cursor-pointer ${
            selectedMember === null ? 'ring-2 ring-white' : ''
          }`}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 shadow-xl hover:scale-105`}
            style={{ backgroundColor: currentUser.avatar_color, color: 'white' }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{currentUser.username} (You)</span>
          </div>
        </div>

        {/* Family Members */}
        {familyMembers.map((member) => (
          <div 
            key={member.id}
            className={`relative group cursor-pointer ${
              selectedMember?.id === member.id ? 'ring-2 ring-white' : ''
            }`}
            onClick={() => setSelectedMember(member)}
          >
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 shadow-xl hover:scale-105`}
              style={{ backgroundColor: member.avatarColor || '#8b5cf6', color: 'white' }}
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{member.name}</span>
              
              {/* Delete button - only visible on hover */}
              <button
                onClick={(e) => handleDeleteMember(member.id, e)}
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
      )}

      {/* Selected member info */}
      {selectedMember && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <h3 className="text-white font-medium mb-2">Currently viewing travels for:</h3>
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: selectedMember.avatarColor || '#8b5cf6' }}
            >
              {selectedMember.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-300">{selectedMember.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

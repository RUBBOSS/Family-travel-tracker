'use client';

import { useUserContext } from '@/context/UserContext';

export default function FamilyMemberTabs() {
  const { currentUser } = useUserContext();

  if (!currentUser) {
    return (
      <div className="text-center py-6 rounded-lg bg-slate-700/50">
        <p className="text-slate-300">No user logged in</p>
        <p className="text-slate-400 text-sm mt-2">Please log in to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative group">        <div
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ring-2 ring-white shadow-xl`}
          style={{ backgroundColor: currentUser.avatar_color, color: 'white' }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            {currentUser.username?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{currentUser.username}</span>
        </div>
      </div>
    </div>
  );
}

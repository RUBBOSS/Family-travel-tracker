'use client';

import { motion } from 'framer-motion';
import { useUserContext } from '@/context/UserContext';

export default function Header() {
  const { currentUser } = useUserContext();

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="text-3xl"
              initial={{ rotate: -15 }}
              animate={{ rotate: 15 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            >
              🌍
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">Family Travel Tracker</h1>
              <p className="text-slate-400">Discover the world together</p>
            </div>
          </div>
            {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Current traveler</p>
                <p className="font-semibold" style={{ color: currentUser.avatar_color }}>{currentUser.username}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" 
                style={{ backgroundColor: currentUser.avatar_color }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">
              No user selected
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

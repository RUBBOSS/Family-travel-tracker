'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Define the type for user profile
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_color: string;
  email?: string;
}

// Define the type for the context value
export interface UserContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component that wraps app and makes auth object available to any child component that calls useUserContext()
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const isAuthenticatedRef = useRef<boolean>(false);

  // Function to check if user_profiles table exists
  const checkTableExists = useCallback(async (): Promise<boolean> => {
    // Don't check table if user is not authenticated
    if (!isAuthenticatedRef.current) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      return !error;
    } catch (err) {
      return false;
    }
  }, []);

  // Function to fetch user profile data
  const fetchUserProfile = useCallback(async (authUser: User): Promise<UserProfile | null> => {
    if (!authUser?.id) {
      console.log('No auth user provided to fetchUserProfile');
      return null;
    }

    try {
      // First check if the table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.log('user_profiles table does not exist, using basic profile');
        return {
          id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_color: '#3B82F6',
          email: authUser.email || undefined
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return {
          id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_color: '#3B82F6',
          email: authUser.email || undefined
        };
      }

      return profile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, [checkTableExists]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (initialSession?.user) {
          isAuthenticatedRef.current = true;
          setSession(initialSession);
          const profile = await fetchUserProfile(initialSession.user);
          setCurrentUser(profile);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event);
          setSession(newSession);

          if (event === 'SIGNED_IN' && newSession?.user) {
            isAuthenticatedRef.current = true;
            const profile = await fetchUserProfile(newSession.user);
            setCurrentUser(profile);
          } else if (event === 'SIGNED_OUT') {
            isAuthenticatedRef.current = false;
            setCurrentUser(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  // Create the context value object with all required properties
  const contextValue: UserContextType = {
    currentUser,
    setCurrentUser,
    isLoading,
    error
  };

  // Provide the context value to children
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the auth context
export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

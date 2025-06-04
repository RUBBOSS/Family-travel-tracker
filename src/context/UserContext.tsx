'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';

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
  const fetchUserProfile = useCallback(async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser || !authUser.id) {
      console.log('No auth user provided to fetchUserProfile');
      return null;
    }
    
    // Double-check auth state before making any database calls
    if (!isAuthenticatedRef.current) {
      console.log('User not authenticated, skipping profile fetch');
      return null;
    }
    
    try {
      // First check if the table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.error('user_profiles table does not exist or is not accessible');
        
        // Return a basic profile if table doesn't exist
        const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User';
        const fullName = authUser.user_metadata?.full_name || username;
        
        return {
          id: authUser.id,
          username: username,
          full_name: fullName,
          avatar_color: '#3B82F6',
          email: authUser.email
        };
      }

      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id);
        
      if (profileError) {
        console.error('Error fetching user profile:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });
        
        // Try to get username from auth metadata first, then fallback to email prefix
        const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User';
        const fullName = authUser.user_metadata?.full_name || username;
        
        // Return a basic profile if database query fails
        return {
          id: authUser.id,
          username: username,
          full_name: fullName,
          avatar_color: '#3B82F6',
          email: authUser.email
        };
      }

      // Check if user profile exists in the result
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      
      if (!profile) {
        console.log('No user profile found in database, attempting to create one...');
        
        // Try to create a user profile in the database
        try {
          const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User';
          const fullName = authUser.user_metadata?.full_name || username;
          
          const newProfile = {
            id: authUser.id,
            username: username,
            full_name: fullName,
            avatar_color: '#3B82F6'
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select();

          if (createError) {
            console.error('Error creating user profile:', createError);
            // Return fallback profile even if creation fails
            return {
              ...newProfile,
              email: authUser.email
            };
          }

          console.log('✅ User profile created successfully:', createdProfile);
          const profileData = createdProfile && createdProfile.length > 0 ? createdProfile[0] : newProfile;
          return {
            ...profileData,
            email: authUser.email
          };
        } catch (err) {
          console.error('Error creating user profile:', err);
          // Return fallback profile
          const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User';
          const fullName = authUser.user_metadata?.full_name || username;
          
          return {
            id: authUser.id,
            username: username,
            full_name: fullName,
            avatar_color: '#3B82F6',
            email: authUser.email
          };
        }
      }
      
      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name || profile.username,
        avatar_color: profile.avatar_color,
        email: authUser.email
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, [checkTableExists]);

  // Initial user load and auth state change subscription
  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      try {
        // Get initial session
        const { data, error: supabaseError } = await supabase.auth.getUser();
        if (supabaseError) throw supabaseError;
        
        if (data?.user) {
          isAuthenticatedRef.current = true;
          const userProfile = await fetchUserProfile(data.user);
          setCurrentUser(userProfile);
        } else {
          isAuthenticatedRef.current = false;
          setCurrentUser(null);
        }
      } catch (err: any) {
        console.error('Error loading user:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          isAuthenticatedRef.current = false;
          setCurrentUser(null);
          setError(null);
          setIsLoading(false);
        } else if (session?.user) {
          isAuthenticatedRef.current = true;
          try {
            const userProfile = await fetchUserProfile(session.user);
            setCurrentUser(userProfile);
            setError(null);
          } catch (err: any) {
            console.error('Error fetching profile after auth change:', err);
            setError(err.message);
          } finally {
            setIsLoading(false);
          }
        }
      }
    );
    
    // Clean up the subscription when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
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

import { useState, useEffect, useCallback } from 'react';
import { FamilyMember } from '@/db/schema-unified';
import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';

export interface FamilyMemberWithMeta extends FamilyMember {
  visitedCountriesCount?: number;
}

export function useFamilyMembers() {
  const { currentUser } = useUserContext();
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyMembers = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!currentUser) {
      setFamilyMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the current user's session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.access_token) {
        console.error('No valid session available:', sessionError);
        setFamilyMembers([]);
        setLoading(false);
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      const response = await fetch('/api/family-members', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch family members');
      }
      
      const data = await response.json();
      setFamilyMembers(data.familyMembers || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch family members');    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addFamilyMember = useCallback(async (name: string, avatarColor: string) => {
    if (!currentUser) return;
    
    try {
      // Get the current user's session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication error');
      }
      
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, avatarColor }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add family member');
      }      const data = await response.json();
      setFamilyMembers(prev => [...prev, data.familyMember]);
      return data.familyMember;
    } catch (err) {
      console.error('Error adding family member:', err);
      throw err;
    }
  }, [currentUser]);

  const deleteFamilyMember = useCallback(async (id: number) => {
    if (!currentUser) return;
    
    try {
      // Get the current user's session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication error');
      }
      
      const response = await fetch(`/api/family-members?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete family member');
      }      setFamilyMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error deleting family member:', err);
      throw err;
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  return {
    familyMembers,
    loading,
    error,
    fetchFamilyMembers,
    addFamilyMember,
    deleteFamilyMember,
  };
}

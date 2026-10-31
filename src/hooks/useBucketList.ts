import { supabase } from '@/utils/supabaseClient';
import { useUserContext } from '@/context/UserContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { FamilyScope } from './useVisitedCountries';

export type BucketListItem = {
  id: number;
  countryId: number;
  familyMemberId: number | null;
  notes: string;
  countryName: string;
  countryCode: string;
  flagUrl: string | null;
  region: string | null;
};

export function useBucketList(selectedFamilyMemberId: FamilyScope = null) {
  const { currentUser } = useUserContext();
  const { t } = useLanguage();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedKey = useRef<string | null>(null);

  const fetchBucketList = useCallback(async (forceRefresh = false) => {
    if (!currentUser?.id) {
      setItems([]);
      setIsLoading(false);
      lastFetchedKey.current = null;
      return;
    }

    const cacheKey = `${currentUser.id}-${selectedFamilyMemberId ?? 'none'}`;
    if (!forceRefresh && lastFetchedKey.current === cacheKey) return;

    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return;

      const url = selectedFamilyMemberId !== null
        ? `/api/bucket-list?family_member_id=${selectedFamilyMemberId}`
        : '/api/bucket-list?family_member_id=all';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // The migration may not be applied yet — treat as empty, not an error.
        if (response.status === 500 || response.status === 404) {
          setItems([]);
          lastFetchedKey.current = cacheKey;
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);
      lastFetchedKey.current = cacheKey;
    } catch (err: any) {
      console.error('Error fetching bucket list:', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, selectedFamilyMemberId]);

  const addToBucketList = useCallback(async (countryId: number, notes: string = '', familyMemberId: FamilyScope = null) => {
    if (!currentUser) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error(t('toast.sessionExpired'));

      const response = await fetch('/api/bucket-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          countryId,
          notes,
          familyMemberId: familyMemberId === 'all' ? null : familyMemberId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast.success(t('toast.bucketAdded'));
      lastFetchedKey.current = null;
      await fetchBucketList(true);
    } catch (err: any) {
      console.error('Error adding to bucket list:', err);
      toast.error(err.message || 'Failed to add to bucket list');
      throw err;
    }
  }, [currentUser, fetchBucketList]);

  const removeFromBucketList = useCallback(async (id: number) => {
    if (!currentUser) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Your session expired — please sign in again.');

      const response = await fetch(`/api/bucket-list?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast.success(t('toast.bucketRemoved'));
      lastFetchedKey.current = null;
      await fetchBucketList(true);
    } catch (err: any) {
      console.error('Error removing bucket list entry:', err);
      toast.error(err.message || 'Failed to remove from bucket list');
      throw err;
    }
  }, [currentUser, fetchBucketList]);

  useEffect(() => {
    if (currentUser?.id) {
      lastFetchedKey.current = null;
      fetchBucketList(true);
    } else {
      setItems([]);
      lastFetchedKey.current = null;
    }
  }, [currentUser?.id, selectedFamilyMemberId, fetchBucketList]);

  const bucketCountryCodes = items
    .map(item => item.countryCode)
    .filter(code => code && code !== 'XX');

  return {
    bucketItems: items,
    bucketCountryCodes,
    isLoading,
    addToBucketList,
    removeFromBucketList,
    fetchBucketList,
  };
}

// Utility to completely clear authentication state
import { supabase } from './supabaseClient';

export async function clearAuthState() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Reload the page to reset all state
    window.location.reload();
  } catch (error) {
    console.error('Error clearing auth state:', error);
    // Even if there's an error, clear storage and reload
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
}

// Add this to global window object for easy access from console
if (typeof window !== 'undefined') {
  (window as any).clearAuth = clearAuthState;
}

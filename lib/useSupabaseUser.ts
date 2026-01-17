"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Helper to get dummy session from cookie
function getDummySession() {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie.split('; ').find(row => row.startsWith('sb-dummy-session='));
  if (!cookie) return null;
  try {
    const value = decodeURIComponent(cookie.split('=')[1]);
    const session = JSON.parse(value);
    return session.user;
  } catch {
    return null;
  }
}

export function useSupabaseUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Check for dummy session first
    const dummyUser = getDummySession();
    if (dummyUser) {
      Promise.resolve().then(() => {
        if (mounted) {
          setUser(dummyUser as import('@supabase/supabase-js').User);
          setLoading(false);
        }
      });
      return;
    }
    
    // Normal Supabase auth
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading } as const;
}

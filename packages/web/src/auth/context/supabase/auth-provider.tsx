'use client';

import type { AuthContextValue } from '../../types';

import { useMemo, useEffect, useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      return !!session?.user;
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check initial session
    checkUserSession().finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkUserSession]);

  const memoizedValue: AuthContextValue = useMemo(
    () => ({
      user,
      loading,
      authenticated: !!user,
      unauthenticated: !user && !loading,
      checkUserSession,
    }),
    [user, loading, checkUserSession]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
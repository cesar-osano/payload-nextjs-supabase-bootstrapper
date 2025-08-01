import { supabase } from '@/lib/supabase';

// ----------------------------------------------------------------------

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};
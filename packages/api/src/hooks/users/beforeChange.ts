import type { CollectionBeforeChangeHook } from 'payload';
import { supabaseAdmin } from '../../lib/supabase';

export const beforeChangeHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  // Only process for create operations and when user doesn't have supabaseId yet
  // All users in this collection get Supabase invites (no super users here)
  if (operation === 'create' && !data.supabaseId && data.email) {
    try {
      console.log(`Creating Supabase invite for user: ${data.email}`);
      
      // Send invite through Supabase - user will need to set password
      const { data: supabaseData, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:5000'}/auth/set-password`,
        data: {
          displayName: data.name || data.email,
        },
      });

      if (error) {
        console.error('Supabase invite error:', error);
        throw new Error(`Failed to send invite: ${error.message}`);
      }

      if (supabaseData?.user?.id) {
        // Set the Supabase ID in the data that will be persisted
        data.supabaseId = supabaseData.user.id;
        console.log(`User ${data.email} invited successfully. Supabase ID: ${supabaseData.user.id}`);
      }
    } catch (error) {
      console.error('Error in user beforeChange hook:', error);
      throw error; // Throw error to prevent user creation if invite fails
    }
  }

  return data;
};
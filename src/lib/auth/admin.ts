// ==============================================================================
// PERLE NOIRE - SERVER-SIDE ADMIN AUTHORIZATION
// Centralized, strict verification of administrator identity & active status
// ==============================================================================

import { createClient } from '@/lib/supabase/server';
import { AdminUser } from '@/types/database';

/**
 * Retrieves the currently authenticated Supabase user, looks up their
 * corresponding record in the `admins` table, and verifies `active = true`.
 * Returns null if not authenticated, not an admin, or inactive.
 */
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    // If Supabase is not configured, no admin session can be legitimately authenticated
    return null;
  }

  try {
    const supabase = await createClient();

    // 1. Verify user with Supabase Auth server (never trust unverified client tokens)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // 2. Query the admins table by user_id and active status
    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .single();

    if (adminError || !adminRecord) {
      return null;
    }

    return adminRecord as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Strict server guard for administrative operations and Server Actions.
 * Throws an explicit error if the caller is not an active authenticated admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    throw new Error(
      'Accès refusé : privilèges administrateur requis. Vous devez être connecté avec un compte administrateur actif.'
    );
  }

  return admin;
}

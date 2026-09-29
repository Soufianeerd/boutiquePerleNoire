// ==============================================================================
// PERLE NOIRE - SUPABASE ADMIN CLIENT (SERVICE ROLE)
// Strictly for background tasks, webhooks & elevated server operations
// ==============================================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: createAdminClient cannot be executed in the browser.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === 'placeholder-service-key') {
    throw new Error('Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing or invalid.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ==============================================================================
// PERLE NOIRE - APPLICATION PROXY (NEXT.JS 16)
// Strict Server-Side Admin Authentication Guard & Route Protection
// ==============================================================================

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session & get real Supabase user via auth.getUser()
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 1. ADMIN ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // Public access only for admin login page
    if (pathname === '/admin/login') {
      // If user is already an authenticated and active admin, redirect them directly to /admin
      if (user) {
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .eq('active', true)
          .maybeSingle();

        if (adminRecord) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return supabaseResponse;
    }

    // All other /admin and /admin/* routes require a verified active admin:
    // Case A: No authenticated Supabase session
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Case B: User has a valid Supabase account, but verify they exist in `admins` with `active = true`
    const { data: adminRecord, error: adminQueryError } = await supabase
      .from('admins')
      .select('id, active')
      .eq('user_id', user.id)
      .eq('active', true)
      .maybeSingle();

    if (adminQueryError || !adminRecord) {
      // Authenticated Supabase user is NOT in admins or inactive -> revoke and redirect
      await supabase.auth.signOut();
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. COMMERCE ROUTE PROTECTION (/panier, /checkout)
  if (pathname.startsWith('/panier') || pathname.startsWith('/checkout')) {
    const commerceDisabledCookie = request.cookies.get('pn_vitrine_mode')?.value;
    if (commerceDisabledCookie === 'true') {
      const redirectUrl = new URL('/bijoux', request.url);
      redirectUrl.searchParams.set('mode', 'vitrine');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/panier',
    '/checkout',
  ],
};

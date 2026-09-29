// ==============================================================================
// PERLE NOIRE - APPLICATION MIDDLEWARE
// Admin Authentication Guard & Storefront Mode Routing
// ==============================================================================

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADMIN ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // Allow public access to admin login page and login assets
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check admin authentication session cookie
    // Supports both standard Supabase auth cookie and dev admin session cookie
    const supabaseAuthToken = request.cookies.get('sb-access-token')?.value ||
                              request.cookies.get('sb-refresh-token')?.value ||
                              request.cookies.get('pn_admin_session')?.value;

    // In local development or staging, an admin cookie 'pn_admin_session' or active Supabase session grants access
    if (!supabaseAuthToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. COMMERCE ROUTE PROTECTION (/panier, /checkout)
  // If e-commerce is deactivated, the store operates in Vitrine mode.
  // Note: Detailed user feedback can also be presented on the page itself.
  if (pathname.startsWith('/panier') || pathname.startsWith('/checkout')) {
    const commerceDisabledCookie = request.cookies.get('pn_vitrine_mode')?.value;
    if (commerceDisabledCookie === 'true') {
      const redirectUrl = new URL('/bijoux', request.url);
      redirectUrl.searchParams.set('mode', 'vitrine');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/panier',
    '/checkout',
  ],
};

import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow auth callback through without protection
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }
  
  const isProtected = pathname.startsWith('/home') || pathname.startsWith('/api/credit') || pathname.startsWith('/api/advisor');
  if (!isProtected) return NextResponse.next();

  // Check for dummy session bypass (cookie already present)
  const dummySession = req.cookies.get('sb-dummy-session');
  if (dummySession) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Always allow with a demo cookie in this deployment (bypass auth)
    const email = process.env.DUMMY_AUTH_EMAIL || 'tech4earthh@adapt.demo';
    const id = process.env.DUMMY_AUTH_USER_ID || 'demo-user-0001';
    const demoCookie = JSON.stringify({ user: { id, email } });
    res.cookies.set('sb-dummy-session', encodeURIComponent(demoCookie), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;

    // If you want to enforce auth instead, comment out the above and use the redirect/401 below.
    /*
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
    */
  }
  
  return res;
}

export const config = {
  matcher: ['/auth/callback', '/home/:path*', '/api/credit/:path*', '/api/advisor/:path*'],
};

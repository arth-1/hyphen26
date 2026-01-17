import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle dummy/bypass login for demo accounts
    if (body?.user?.email === 'tech4earthh@gmail.com' || body?.user?.id === 'tech4earthh-dummy-id') {
      const res = new NextResponse(JSON.stringify({ success: true, dummy: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Set a dummy session cookie that the middleware will recognize
      res.cookies.set('sb-dummy-session', JSON.stringify({
        user: {
          id: 'tech4earthh-dummy-id',
          email: 'tech4earthh@gmail.com',
          user_metadata: { name: 'Ramesh Kumar' }
        }
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return res;
    }
    
    // Normal Supabase auth flow
    const access_token = body?.access_token as string | undefined;
    const refresh_token = body?.refresh_token as string | undefined;
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'access_token and refresh_token are required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const res = new NextResponse(null, { status: 204 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string) {
            res.cookies.set(name, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 1 week
              path: '/',
            });
          },
          remove(name: string) {
            res.cookies.set(name, '', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 0,
              path: '/',
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

"use client";
import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import Auth from '@/components/Auth';

function SignInContent() {
  const { user } = useSupabaseUser();
  const router = useRouter();
  const params = useSearchParams();
  const autoLoginAttempted = useRef(false);

  // Auto-login with tech4earthh dummy account in production
  useEffect(() => {
    if (!user && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true;
      // Auto-login as dummy user
      fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            id: 'tech4earthh-dummy-id',
            email: 'tech4earthh@gmail.com',
            user_metadata: { name: 'Ramesh Kumar' }
          },
          session: { access_token: 'dummy-token', refresh_token: 'dummy-refresh' }
        })
      }).then(() => {
        // Reload to pick up the session
        window.location.href = '/home';
      }).catch(() => {
        // If auto-login fails, just show the auth form
        console.log('Auto-login skipped');
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const back = params.get('redirectedFrom') || '/home';
      router.replace(back);
    }
  }, [user, router, params]);

  return <Auth />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>}>
      <SignInContent />
    </Suspense>
  );
}

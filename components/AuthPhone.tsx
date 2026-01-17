"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPhone(): React.JSX.Element {
  const [phone, setPhone] = useState<string>('+91');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phase, setPhase] = useState<'enter' | 'verify'>('enter');
  const [otp, setOtp] = useState<string>('');
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Small help tips for the UI
  const tips = useMemo(
    () => (
      <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
        <li>Use full E.164 format, e.g. +919876543210</li>
        <li>Supabase Auth → Phone must be configured with a valid SMS provider</li>
      </ul>
    ),
    []
  );

  // Handle OAuth callback tokens present in the URL hash (e.g. #access_token=...)
  useEffect(() => {
    const handleOAuthTokens = async () => {
      try {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) return;
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (!access_token || !refresh_token) return;

        setLoading(true);
        setMessage('Completing sign-in...');

        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError) throw sessionError;

        // Also set server httpOnly cookies for middleware
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, refresh_token }),
        });

        // Clean URL and redirect
        window.history.replaceState({}, document.title, '/home');
        window.location.href = '/home';
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setMessage(`OAuth error: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthTokens();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    setMessage(null);
    try {
      const lower = email.toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lower,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // set server cookies for middleware
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });

        setMessage('Signed in! Redirecting...');
        setTimeout(() => (window.location.href = '/home'), 300);
      } else {
        setMessage('Signed in! Redirecting...');
        setTimeout(() => (window.location.href = '/home'), 300);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to sign in';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function requestOtpPhone() {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: 'sms', shouldCreateUser: true },
      });
      if (error) throw error;

      setPhase('verify');
      setMessage('OTP sent. Please check your SMS.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to request OTP';
      if (/unsupported phone provider/i.test(msg)) {
        setMessage(
          'Phone OTP is not enabled for this project. Configure an SMS provider in Supabase Auth → Phone.'
        );
      } else {
        setMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpPhone() {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;

      // fetch session and set server cookies
      const session = await supabase.auth.getSession();
      const access_token = session.data.session?.access_token;
      const refresh_token = session.data.session?.refresh_token;
      if (access_token && refresh_token) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token, refresh_token }),
        });
      }

      setMessage('Signed in! Redirecting...');
      setTimeout(() => (window.location.href = '/home'), 300);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to verify OTP';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      // Browser will redirect to Google
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start Google sign-in';
      setMessage(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold">Sign in</h1>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAuthMode('phone')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              authMode === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Phone
          </button>
          <button
            onClick={() => setAuthMode('email')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              authMode === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Email
          </button>
        </div>

        {authMode === 'phone' ? (
          <>
            {phase === 'enter' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Phone Number</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  onClick={requestOtpPhone}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
                {tips}
              </div>
            )}

            {phase === 'verify' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Enter OTP</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 tracking-widest text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                />
                <button
                  onClick={verifyOtpPhone}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="block text-sm font-medium mt-2">Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email && password) signInWithEmail();
                }}
              />

              <button
                onClick={signInWithEmail}
                disabled={loading || !email || !password}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white border rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 31.9 29.2 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 5.1 29.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.3-7.6 20.9-17.5.1-.7.1-1.3.1-2V20.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.2 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 5.1 29.1 3 24 3 16.3 3 9.6 7.1 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.6 2.1-7.1 2.1-5.1 0-9.4-3.4-10.9-8.1l-6.6 5.1C9.6 40.9 16.2 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.9-5.1 7-9.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 5.1 29.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.3-7.6 20.9-17.5.1-.7.1-1.3.1-2V20.5z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

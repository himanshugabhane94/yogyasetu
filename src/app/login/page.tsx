'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import OtpInput from '@/components/OtpInput';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Mode: 'citizen' (Email OTP) | 'admin' (Password)
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Email OTP States
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Admin Password States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSigningInAdmin, setIsSigningInAdmin] = useState(false);

  // Feedback Messages
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check URL error parameter (e.g. from OAuth redirect)
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'OAuthCallback' || errorParam === 'OAuthSignin') {
        setError('Google sign-in could not be completed. Please ensure your Gmail is added to Test Users in Google Cloud Console.');
      } else if (errorParam === 'OAuthAccountNotLinked') {
        setError('An account already exists with this email address.');
      } else if (errorParam === 'AccessDenied') {
        setError('Access was denied. Please try again.');
      } else {
        setError(`Sign-in error: ${errorParam}`);
      }
    }
  }, [searchParams]);

  // =========================================================================
  // 1. EMAIL OTP FLOW
  // =========================================================================
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setInfoMessage('');
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not send OTP, try again');
      }

      setMaskedEmail(data.maskedEmail || email);
      setStep('otp');
      setOtp('');

      setInfoMessage(data.message || 'OTP dispatched to your email.');
    } catch (err: any) {
      setError(err?.message || 'Could not send OTP, try again');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setIsVerifyingOtp(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        authType: 'email_otp',
        email: email.trim().toLowerCase(),
        otp: code.trim(),
      });

      if (res?.error) {
        setError(res.error);
        setIsVerifyingOtp(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed. Please try again.');
      setIsVerifyingOtp(false);
    }
  };

  // =========================================================================
  // 2. GOOGLE OAUTH FLOW
  // =========================================================================
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err: any) {
      setError('Google Sign-In is not enabled or encountered an error.');
      setIsGoogleLoading(false);
    }
  };

  // =========================================================================
  // 3. ADMIN PASSWORD FLOW
  // =========================================================================
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setIsSigningInAdmin(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        authType: 'password',
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid admin credentials.');
    } finally {
      setIsSigningInAdmin(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      {/* Centered Narrow Login Container */}
      <div className="w-full max-w-[390px]">
        {/* Top Logo & Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center text-govNavy-950 shadow-sm border border-saffron-400 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5">
                <path d="M3 17c3-5 8-8 13-5 2.5 1.5 4 3.5 5 5" />
                <path d="M4 17v4" />
                <path d="M9 14v7" />
                <path d="M15 13v8" />
                <path d="M20 17v4" />
                <circle cx="12" cy="7" r="2" fill="#0B3D91" />
              </svg>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isAdminMode ? 'Admin Sign In' : 'Citizen Sign In'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdminMode
              ? 'Enter official credentials to access console'
              : step === 'email'
              ? 'Enter your email to receive a verification code'
              : `Code sent to ${maskedEmail}`}
          </p>
        </div>

        {/* Main Clean Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Alert */}
          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-govEmerald-50 border border-govEmerald-200 text-govEmerald-900 text-xs font-semibold flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-govEmerald-600 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {!isAdminMode ? (
            /* ========================================================= */
            /* CITIZEN LOGIN (Email OTP + Google)                        */
            /* ========================================================= */
            <div>
              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:border-govNavy-900 focus:ring-1 focus:ring-govNavy-900 outline-none transition-colors h-11"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full h-11 bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-govNavy-950 font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* 6-box auto-focus OTP Component */}
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={(code) => handleVerifyOtp(code)}
                    onResend={() => handleSendOtp()}
                    isResending={isSendingOtp}
                    resendCooldown={30}
                    hasError={Boolean(error)}
                    disabled={isVerifyingOtp}
                  />

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isVerifyingOtp || otp.length !== 6}
                    className="w-full h-11 bg-govNavy-900 hover:bg-govNavy-800 active:bg-govNavy-950 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-govEmerald-400" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setError('');
                        setInfoMessage('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-govNavy-900 transition-colors"
                    >
                      ← Use a different email
                    </button>
                  </div>
                </div>
              )}

              {/* Minimal Divider */}
              {step === 'email' && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2.5 text-slate-400 font-medium">or</span>
                    </div>
                  </div>

                  {/* Continue with Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full h-11 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm rounded-lg border border-slate-300 transition-colors flex items-center justify-center space-x-2.5 shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* ADMIN LOGIN (Password)                                    */
            /* ========================================================= */
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@yogyasetu.gov.in"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:border-govNavy-900 focus:ring-1 focus:ring-govNavy-900 outline-none h-11"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-govNavy-900 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:border-govNavy-900 focus:ring-1 focus:ring-govNavy-900 outline-none h-11"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningInAdmin}
                className="w-full h-11 bg-govNavy-900 hover:bg-govNavy-800 active:bg-govNavy-950 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSigningInAdmin ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-saffron-400" />
                    <span>Sign In as Admin</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* GitHub-Style Bottom Registration Card */}
        <div className="mt-4 p-4 text-center rounded-2xl border border-slate-200/90 bg-white text-xs text-slate-600 shadow-sm">
          New citizen on YogyaSetu?{' '}
          <Link
            href="/register"
            className="font-bold text-govNavy-900 hover:text-saffron-600 hover:underline"
          >
            Register Profile
          </Link>
        </div>

        {/* Admin Switcher Link */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
              setInfoMessage('');
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center space-x-1"
          >
            {isAdminMode ? (
              <>
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Citizen Sign In</span>
              </>
            ) : (
              <span>Admin / Officer Password Login</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading Sign In...</div>}>
      <LoginContent />
    </Suspense>
  );
}

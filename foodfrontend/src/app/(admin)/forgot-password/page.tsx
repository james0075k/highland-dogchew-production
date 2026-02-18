'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1e35] via-[#132f4f] to-[#091a2e] px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <GiDogBowl className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-blue-200/60 text-sm mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-emerald-400 text-2xl" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Check Your Email</h3>
              <p className="text-blue-200/60 text-sm mb-6">
                If an account with that email exists, we&apos;ve sent a password reset link.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors"
              >
                <FiArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all text-sm"
                    placeholder="admin@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors"
                >
                  <FiArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

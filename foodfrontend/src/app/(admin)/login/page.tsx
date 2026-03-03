'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.data?.accessToken) {
        Cookies.set('token', data.data.accessToken, { expires: 1, path: '/' }); // 1-day persistent cookie
        localStorage.setItem('adminToken', data.data.accessToken); // localStorage fallback
      }
      if (data.data?.refreshToken) {
        Cookies.set('refreshToken', data.data.refreshToken, { expires: 7, path: '/' }); // 7-day persistent cookie
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1e35] via-[#132f4f] to-[#091a2e] px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/25 transform hover:scale-105 transition-transform duration-300">
            <GiDogBowl className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Highland Yak Chew</h1>
          <p className="text-blue-200/50 text-sm">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-blue-200/50 text-sm mt-1">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl animate-[fadeIn_0.3s_ease]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          &copy; {new Date().getFullYear()} Highland Yak Chew. All rights reserved.
        </p>
      </div>
    </div>
  );
}

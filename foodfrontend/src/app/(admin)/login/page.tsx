"use client";
import React, { useState } from "react";
import Logo from "@/components/atoms/Logo";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";



export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {  
    setError("Please enter both email and password.");
    return;
  }
  setError("");
  setLoading(true);

  try {
 

     const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    }
  );

    // First check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

   if (data.data?.accessToken) {
  Cookies.set("token", data.data.accessToken);
}
if (data.data?.refreshToken) {
  Cookies.set("refreshToken", data.data.refreshToken);
}
   

   

    router.push("/dashboard");
    console.log("Logged in successfully:", data);
    
  } catch (err) {
    console.error("Login error:", err);
    setError(err instanceof Error ? err.message : "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary/10 via-white to-primary/5">
      {/* Left: Branding/Welcome */}
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-[#0e334f] text-white px-8 py-16 md:min-h-screen border-r-0 md:border-r md:border-white/20">
        <div className="max-w-xs w-full flex flex-col items-center gap-6">
          <div className="mb-4 w-32 h-32 md:w-40 md:h-40 mx-auto animate-fade-in">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back!</h2>
          <p className="text-lg text-center text-white/80">Sign in to access your admin dashboard and manage your site.</p>
          <img src="/images/login-illustration.svg" alt="Login Illustration" className="w-40 h-40 mt-8 hidden md:block" />
        </div>
      </div>
      {/* Right: Login Form */}
      <div className="md:w-1/2 flex flex-col justify-center items-center px-6 py-20 min-h-screen">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 flex flex-col gap-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Admin Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="on">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base bg-white transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base bg-white transition pr-12"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10-.657 0-1.299-.064-1.925-.187" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.21-6.293A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-2.21.714-4.253 1.927-5.907" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
            </div>
            {error && <div className="text-red-500 text-sm text-center animate-fade-in">{error}</div>}
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold rounded-lg py-3 mt-4 shadow-sm hover:bg-primary/90 transition text-lg flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="text-xs text-gray-400 text-center pt-6 border-t border-gray-100 mt-4">
            &copy; {new Date().getFullYear()} Fusion Expeditions. All rights reserved.
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 
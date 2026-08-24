'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/store/cart';
import { toast } from 'react-hot-toast';

function LoginPageInner() {
  const router = useRouter();
  const nextUrl = useSearchParams().get('next') || '/';
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      router.push(nextUrl);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-5 py-14">
      <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-[#E8E5DE] rounded-full flex items-center justify-center mb-8">
        <ArrowLeft size={14} className="text-[#2C2C2A]" />
      </button>

      <h1 className="font-serif text-[28px] text-[#2C2C2A] mb-1">Welcome back</h1>
      <p className="text-[13px] text-[#888780] mb-8">Sign in to your TiffinGo account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-[#5F5E5A] mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-[#E8E5DE] rounded-xl px-4 py-3 text-[14px] bg-white"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#5F5E5A] mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-[#E8E5DE] rounded-xl px-4 py-3 text-[14px] bg-white pr-12"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff size={16} className="text-[#B4B2A9]" /> : <Eye size={16} className="text-[#B4B2A9]" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium disabled:opacity-60 mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-[13px] text-[#888780] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-[#1D9E75] font-medium">Create one</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}><p className="text-[13px] text-[#8A9A8A]">Loading…</p></div>}>
      <LoginPageInner />
    </Suspense>
  );
}

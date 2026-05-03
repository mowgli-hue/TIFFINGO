'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/store/cart';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Sign up failed');
      setUser(data.user);
      toast.success(`Welcome to TiffinGo, ${data.user.name.split(' ')[0]}!`);
      router.push('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-5 py-14">
      <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-[#E8E5DE] rounded-full flex items-center justify-center mb-8">
        <ArrowLeft size={14} className="text-[#2C2C2A]" />
      </button>

      <h1 className="font-serif text-[28px] text-[#2C2C2A] mb-1">Create account</h1>
      <p className="text-[13px] text-[#888780] mb-8">Join TiffinGo and start eating better today</p>

      <form onSubmit={handleSignup} className="space-y-4">
        {[
          { key: 'name',     label: 'Full name',     type: 'text',     placeholder: 'Priya Sharma'         },
          { key: 'email',    label: 'Email',          type: 'email',    placeholder: 'you@example.com'      },
          { key: 'phone',    label: 'Phone (optional)', type: 'tel',    placeholder: '+1 604 000 0000'      },
          { key: 'password', label: 'Password',       type: 'password', placeholder: 'At least 8 characters' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="text-[12px] font-medium text-[#5F5E5A] mb-1.5 block">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={set(key)}
              placeholder={placeholder}
              required={key !== 'phone'}
              className="w-full border border-[#E8E5DE] rounded-xl px-4 py-3 text-[14px] bg-white"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[12px] text-[#B4B2A9] mt-4">
        By signing up you agree to our{' '}
        <Link href="#" className="text-[#888780]">Terms</Link> and{' '}
        <Link href="#" className="text-[#888780]">Privacy Policy</Link>
      </p>

      <p className="text-center text-[13px] text-[#888780] mt-4">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[#1D9E75] font-medium">Sign in</Link>
      </p>
    </div>
  );
}

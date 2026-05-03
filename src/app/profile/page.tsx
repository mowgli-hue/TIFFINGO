'use client';
import { useRouter } from 'next/navigation';
import { User, MapPin, CreditCard, Bell, ChevronRight, LogOut, Sparkles, Package } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/store/cart';
import { toast } from 'react-hot-toast';

const MENU_ITEMS = [
  { icon: Package,    label: 'My subscriptions',  href: '/profile/subscriptions' },
  { icon: MapPin,     label: 'Delivery addresses', href: '/profile/addresses' },
  { icon: CreditCard, label: 'Payment methods',    href: '/profile/payment' },
  { icon: Bell,       label: 'Notifications',      href: '/profile/notifications' },
  { icon: Sparkles,   label: 'AI meal planner',    href: '/planner' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    router.push('/');
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? 'TG';

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <div className="px-5 pt-14 pb-6">
        <h1 className="font-serif text-[22px] text-[#2C2C2A] mb-6">Profile</h1>

        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[20px] font-medium text-[#1D9E75] flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-[16px] font-medium text-[#2C2C2A]">{user?.name ?? 'Welcome!'}</p>
            <p className="text-[13px] text-[#888780]">{user?.email ?? 'Sign in to access your account'}</p>
            {user && <p className="text-[11px] text-[#1D9E75] mt-0.5">Vancouver, BC</p>}
          </div>
        </div>

        {/* Stats */}
        {user && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { val: '8',  label: 'Orders' },
              { val: '1',  label: 'Active plan' },
              { val: '4.9', label: 'Avg rating' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-white border border-[#E8E5DE] rounded-2xl p-3 text-center">
                <p className="text-[18px] font-medium text-[#2C2C2A]">{val}</p>
                <p className="text-[10px] text-[#888780] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Menu */}
        {user ? (
          <div className="card overflow-hidden mb-4">
            {MENU_ITEMS.map(({ icon: Icon, label, href }, i) => (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-4 py-3.5 ${i < MENU_ITEMS.length - 1 ? 'border-b border-[#F1EFE8]' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#F1EFE8] flex items-center justify-center">
                    <Icon size={15} className="text-[#5F5E5A]" />
                  </div>
                  <span className="flex-1 text-[13px] text-[#2C2C2A]">{label}</span>
                  <ChevronRight size={14} className="text-[#B4B2A9]" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <Link href="/auth/login">
              <button className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium">
                Sign in
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="w-full py-3.5 bg-white border border-[#E8E5DE] text-[#2C2C2A] rounded-2xl text-[14px] font-medium">
                Create account
              </button>
            </Link>
          </div>
        )}

        {/* App info */}
        <div className="card overflow-hidden mb-4">
          {[
            { label: 'About TiffinGo', href: '#' },
            { label: 'Privacy policy', href: '#' },
            { label: 'Terms of service', href: '#' },
          ].map(({ label, href }, i) => (
            <Link key={label} href={href}>
              <div className={`flex items-center justify-between px-4 py-3 ${i < 2 ? 'border-b border-[#F1EFE8]' : ''}`}>
                <span className="text-[13px] text-[#5F5E5A]">{label}</span>
                <ChevronRight size={13} className="text-[#B4B2A9]" />
              </div>
            </Link>
          ))}
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-[#E8E5DE] bg-white rounded-2xl text-[13px] font-medium text-[#D85A30] flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Sign out
          </button>
        )}

        <p className="text-center text-[10px] text-[#B4B2A9] mt-4">TiffinGo v0.1.0 · Built in Vancouver 🍁</p>
      </div>

      <NavBar />
    </div>
  );
}

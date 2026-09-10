'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, ChevronRight, LogOut, Sparkles, Package,
  LifeBuoy, Shield, FileText, Trash2, AlertTriangle,
} from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth, usePrefs } from '@/store/cart';
import { toast } from 'react-hot-toast';
import { apiFetch } from '@/lib/api-base';

const D = '#043F28', A = '#FEB001', LT = '#FFF8E8', BR = '#E6E3DA';

type Counts = { orders: number; activePlans: number };

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { calorieTarget } = usePrefs();

  const [counts, setCounts] = useState<Counts | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let live = true;
    Promise.all([
      apiFetch('/api/orders').then((r) => (r.ok ? r.json() : { orders: [] })).catch(() => ({ orders: [] })),
      apiFetch('/api/subscriptions').then((r) => (r.ok ? r.json() : { subscriptions: [] })).catch(() => ({ subscriptions: [] })),
    ]).then(([o, s]) => {
      if (!live) return;
      setCounts({
        orders: (o.orders ?? []).length,
        activePlans: (s.subscriptions ?? []).filter((x: { status: string }) => x.status === 'ACTIVE').length,
      });
    });
    return () => { live = false; };
  }, [user]);

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    router.push('/');
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const r = await apiFetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(d.error || 'Could not delete the account'); return; }
      await logout().catch(() => {});
      toast.success('Your account has been deleted.');
      router.push('/');
    } catch {
      toast.error('Could not reach the server — try again');
    } finally {
      setDeleting(false);
    }
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'TG';

  const accountLinks = [
    { icon: Package, label: 'My orders', href: '/orders' },
    { icon: Sparkles, label: 'My weekly plan', href: '/planner' },
    { icon: MapPin, label: 'Browse kitchens', href: '/explore' },
  ];
  const infoLinks = [
    { icon: LifeBuoy, label: 'Support', href: '/support' },
    { icon: Shield, label: 'Privacy policy', href: '/legal/privacy' },
    { icon: FileText, label: 'Terms of service', href: '/legal/terms' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F5F0' }}>
      <div className="px-5 pt-14 pb-6 max-w-lg mx-auto">
        <h1 className="text-[22px] font-bold mb-6" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Profile</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-bold flex-shrink-0"
            style={{ background: LT, color: D }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-bold truncate" style={{ color: D }}>{user?.name ?? 'Welcome'}</p>
            <p className="text-[13px] truncate" style={{ color: '#8A9A8A' }}>
              {user?.email ?? 'Sign in to see your orders and plan'}
            </p>
          </div>
        </div>

        {user && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { val: counts ? String(counts.orders) : '—', label: 'Orders' },
              { val: counts ? String(counts.activePlans) : '—', label: 'Active plans' },
              { val: calorieTarget.toLocaleString(), label: 'Cal target' },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-2xl p-3 text-center bg-white" style={{ border: `0.5px solid ${BR}` }}>
                <p className="text-[17px] font-bold" style={{ color: D }}>{val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8A9A8A' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {user ? (
          <div className="rounded-2xl bg-white overflow-hidden mb-4" style={{ border: `0.5px solid ${BR}` }}>
            {accountLinks.map(({ icon: Icon, label, href }, i) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3.5"
                style={i < accountLinks.length - 1 ? { borderBottom: `0.5px solid ${BR}` } : undefined}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: LT }}>
                  <Icon size={15} color={D} />
                </div>
                <span className="flex-1 text-[13px]" style={{ color: D }}>{label}</span>
                <ChevronRight size={14} color="#B4B2A9" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <Link href="/auth/login" className="block w-full py-3.5 rounded-2xl text-[14px] font-bold text-center"
              style={{ background: D, color: A }}>Sign in</Link>
            <Link href="/auth/signup" className="block w-full py-3.5 rounded-2xl text-[14px] font-semibold text-center bg-white"
              style={{ color: D, border: `0.5px solid ${BR}` }}>Create account</Link>
          </div>
        )}

        <div className="rounded-2xl bg-white overflow-hidden mb-4" style={{ border: `0.5px solid ${BR}` }}>
          {infoLinks.map(({ icon: Icon, label, href }, i) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3"
              style={i < infoLinks.length - 1 ? { borderBottom: `0.5px solid ${BR}` } : undefined}>
              <Icon size={14} color="#8A9A8A" />
              <span className="flex-1 text-[13px]" style={{ color: '#5A6B5A' }}>{label}</span>
              <ChevronRight size={13} color="#B4B2A9" />
            </Link>
          ))}
        </div>

        {user && (
          <>
            <button onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-[13px] font-semibold flex items-center justify-center gap-2 bg-white mb-3"
              style={{ color: D, border: `0.5px solid ${BR}` }}>
              <LogOut size={14} /> Sign out
            </button>

            {/* Required by App Store 5.1.1(v) and Play's data deletion policy:
                deletable from inside the app, not by emailing support. */}
            {!confirmOpen ? (
              <button onClick={() => setConfirmOpen(true)}
                className="w-full py-3 rounded-2xl text-[13px] font-semibold flex items-center justify-center gap-2 bg-white"
                style={{ color: '#B4433F', border: '0.5px solid #F3D4D4' }}>
                <Trash2 size={14} /> Delete my account
              </button>
            ) : (
              <div className="rounded-2xl p-4 bg-white" style={{ border: '0.5px solid #F3D4D4' }}>
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle size={15} color="#B4433F" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold mb-1" style={{ color: '#B4433F' }}>This cannot be undone</p>
                    <p className="text-[12px] leading-relaxed" style={{ color: '#8A6A6A' }}>
                      Your account, order history and saved preferences are permanently deleted, and any
                      hold on your card is released. Type <strong>DELETE</strong> to confirm.
                    </p>
                  </div>
                </div>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoCapitalize="characters"
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] mb-2.5 outline-none"
                  style={{ border: `0.5px solid ${BR}`, color: D }}
                />
                <div className="flex gap-2">
                  <button onClick={() => { setConfirmOpen(false); setConfirmText(''); }}
                    className="flex-1 py-2.5 rounded-xl text-[12.5px] font-semibold bg-white"
                    style={{ color: D, border: `0.5px solid ${BR}` }}>
                    Keep my account
                  </button>
                  <button onClick={handleDelete} disabled={confirmText !== 'DELETE' || deleting}
                    className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold text-white disabled:opacity-40"
                    style={{ background: '#B4433F' }}>
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-[10px] mt-5" style={{ color: '#B4B2A9' }}>
          TiffinGo · Surrey, BC 🍁
        </p>
      </div>

      <NavBar />
    </div>
  );
}

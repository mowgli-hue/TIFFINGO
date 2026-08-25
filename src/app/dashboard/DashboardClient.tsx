'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChefHat, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

const D = '#1A3A2A', A = '#F0B429', B = '#2D6A4A', C = '#F5F5F0', LT = '#FFFBEB', BR = '#D8DDD0';

type Meal = { id: string; day: string; emoji: string; name: string; description: string };
type Order = {
  id: string; status: string; totalAmount: number; createdAt: string;
  mealName?: string | null; deliverySlot?: string | null;
  user?: { name: string | null } | null;
  items: { quantity: number; menuItem?: { name: string } | null }[];
};
type Data = {
  kitchen: null | { id: string; name: string; isOpen: boolean; rating: number; reviewCount: number; commissionPct: number; payoutsEnabled: boolean; bankConnected: boolean; weeklyMeals: Meal[] };
  orders: Order[];
  stats: null | { ordersToday: number; revenueToday: number; ordersAllTime: number; revenueAllTime: number; activeSubs: number };
};

const ST: Record<string, { bg: string; c: string; l: string }> = {
  PENDING:    { bg: '#F0EEE8', c: '#5A6B5A', l: 'New' },
  CONFIRMED:  { bg: '#E8F0E8', c: '#2D6A4A', l: 'Confirmed' },
  PREPARING:  { bg: LT,        c: '#C8941A', l: 'Preparing' },
  ON_THE_WAY: { bg: '#EEF2FF', c: '#3B5BDB', l: 'On the way' },
  DELIVERED:  { bg: '#F0EEE8', c: '#5A6B5A', l: 'Delivered' },
  CANCELLED:  { bg: '#FBEAEA', c: '#B4433F', l: 'Cancelled' },
};

const money = (n: number) => `$${n.toFixed(2)}`;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white" style={{ border: `0.5px solid ${BR}` }}>
      <p className="text-[19px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>{value}</p>
      <p className="text-[11px] font-medium" style={{ color: '#5A6B5A' }}>{label}</p>
      {hint && <p className="text-[10.5px] mt-0.5" style={{ color: '#8A9A8A' }}>{hint}</p>}
    </div>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  async function load() {
    setReloading(true);
    try {
      const r = await fetch('/api/merchant/orders', { cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not load your kitchen');
      setData(d);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setReloading(false);
    }
  }

  useEffect(() => { load(); }, []);

  /* The cutoff decision. Capture turns the customer's hold into a charge;
     release cancels it so they are never charged at all. */
  async function settle(orderId: string, action: 'capture' | 'release') {
    if (action === 'release' && !confirm('Release this hold? The customer will not be charged.')) return;
    try {
      const r = await fetch('/api/payments/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      const j = await r.json();
      if (!r.ok) { alert(j.error || 'That did not go through'); return; }
      load();
    } catch { alert('Could not reach payments — try again'); }
  }

  const k = data?.kitchen;
  const s = data?.stats;

  return (
    <div className="min-h-screen pb-16" style={{ background: C }}>
      <div style={{ background: `linear-gradient(160deg,${D},${B})` }} className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: A }}>
            <ChefHat size={18} style={{ color: D }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-white truncate" style={{ fontFamily: 'Fraunces, serif' }}>
              {k?.name ?? 'Your kitchen'}
            </p>
            <p className="text-[11.5px]" style={{ color: '#C9DDD1' }}>
              {k ? (k.isOpen ? 'Live and taking orders' : 'Pending approval') : 'No kitchen yet'}
            </p>
          </div>
          <button onClick={load} disabled={reloading} aria-label="Refresh"
            className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,.14)' }}>
            <RefreshCw size={15} color="#fff" className={reloading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {error && (
          <div className="rounded-2xl p-4 flex items-start gap-2.5" style={{ background: '#FFF4F4', border: '0.5px solid #F3D4D4' }}>
            <AlertCircle size={15} color="#B4433F" className="mt-0.5" />
            <p className="text-[12.5px]" style={{ color: '#B4433F' }}>{error}</p>
          </div>
        )}

        {!data && !error && (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="rounded-2xl bg-white animate-pulse" style={{ height: 90, border: `0.5px solid ${BR}` }} />)}
          </div>
        )}

        {data && !k && (
          <div className="rounded-2xl p-6 text-center bg-white" style={{ border: `0.5px solid ${BR}` }}>
            <p className="text-[26px] mb-2">🍳</p>
            <p className="text-[14px] font-bold mb-1" style={{ color: D }}>No kitchen on this account</p>
            <p className="text-[12.5px] leading-relaxed mb-5" style={{ color: '#8A9A8A' }}>
              Apply with your menu and we will have you taking orders in about ten minutes.
            </p>
            <Link href="/join" className="inline-block px-6 py-3 rounded-2xl text-[13px] font-bold" style={{ background: D, color: A }}>
              Set up my kitchen
            </Link>
          </div>
        )}

        {k && k.isOpen && !k.payoutsEnabled && (
          <button
            onClick={async () => {
              try {
                const r = await fetch('/api/merchant/stripe-onboard', { method: 'POST' });
                const j = await r.json();
                if (j.url) window.location.href = j.url;
                else alert(j.error || 'Could not open Stripe onboarding');
              } catch { alert('Could not reach Stripe — try again'); }
            }}
            className="w-full rounded-2xl p-4 text-left"
            style={{ background: LT, border: `0.5px solid ${A}` }}>
            <p className="text-[13px] font-bold mb-0.5" style={{ color: D }}>
              💳 {k.bankConnected ? 'Finish connecting your bank' : 'Connect your bank to get paid'}
            </p>
            <p className="text-[11.5px] leading-relaxed" style={{ color: '#8A6A18' }}>
              Your {100 - k.commissionPct}% lands in your account automatically every week.
              Stripe handles the details — takes about 5 minutes. Tap to {k.bankConnected ? 'continue' : 'start'}.
            </p>
          </button>
        )}

        {k && !k.isOpen && (
          <div className="rounded-2xl p-3.5" style={{ background: LT, border: `0.5px solid ${A}` }}>
            <p className="text-[12.5px] font-semibold mb-0.5" style={{ color: '#8A6A18' }}>Waiting on approval</p>
            <p className="text-[11.5px] leading-relaxed" style={{ color: '#8A6A18' }}>
              Customers cannot see your kitchen yet. We will email you the moment it goes live.
            </p>
          </div>
        )}

        {s && (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Orders today" value={String(s.ordersToday)} />
            <Stat label="Revenue today" value={money(s.revenueToday)} hint={`you keep ${100 - (k?.commissionPct ?? 0)}%`} />
            <Stat label="Orders all time" value={String(s.ordersAllTime)} />
            <Stat label="Active weekly plans" value={String(s.activeSubs)} />
          </div>
        )}

        {k && (
          <section>
            <h2 className="text-[14px] font-bold mb-2.5" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Orders</h2>
            {data!.orders.length === 0 ? (
              <div className="rounded-2xl p-5 text-center bg-white" style={{ border: `0.5px solid ${BR}` }}>
                <p className="text-[13px] font-semibold mb-1" style={{ color: D }}>No orders yet</p>
                <p className="text-[12px] leading-relaxed" style={{ color: '#8A9A8A' }}>
                  {k.isOpen
                    ? 'Your kitchen is live. Orders will appear here the moment one comes in.'
                    : 'Orders can only arrive once your kitchen is approved.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data!.orders.map((o) => {
                  const st = ST[o.status] ?? ST.PENDING;
                  return (
                    <div key={o.id} className="rounded-2xl p-3.5 bg-white" style={{ border: `0.5px solid ${BR}` }}>
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-[13px] font-bold" style={{ color: D }}>
                          {o.user?.name || 'Customer'}
                        </p>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.c }}>{st.l}</span>
                      </div>
                      <p className="text-[12px] mb-2" style={{ color: '#5A6B5A' }}>
                        {o.mealName || o.items.map((i) => `${i.quantity}× ${i.menuItem?.name ?? 'Item'}`).join(', ') || 'Weekly plan'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: '#8A9A8A' }}>
                          {new Date(o.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {o.deliverySlot ? ` · ${o.deliverySlot}` : ''}
                        </span>
                        <span className="text-[13px] font-bold" style={{ color: D }}>{money(o.totalAmount)}</span>
                      </div>
                      {o.status === 'CONFIRMED' && (
                        <div className="flex gap-2 mt-2.5 pt-2.5" style={{ borderTop: `0.5px solid ${BR}` }}>
                          <button onClick={() => settle(o.id, 'capture')}
                            className="flex-1 py-2 rounded-xl text-[11.5px] font-bold"
                            style={{ background: D, color: A }}>
                            Confirm — charge {money(o.totalAmount)}
                          </button>
                          <button onClick={() => settle(o.id, 'release')}
                            className="flex-1 py-2 rounded-xl text-[11.5px] font-semibold bg-white"
                            style={{ color: '#B4433F', border: '0.5px solid #F3D4D4' }}>
                            Can&rsquo;t cook — release hold
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {k && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[14px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>This week&rsquo;s meals</h2>
              <Link href={`/kitchen/${k.id}`} className="text-[12px] font-semibold flex items-center gap-0.5" style={{ color: '#C8941A' }}>
                View <ChevronRight size={13} />
              </Link>
            </div>
            {k.weeklyMeals.length === 0 ? (
              <div className="rounded-2xl p-5 text-center bg-white" style={{ border: `0.5px solid ${BR}` }}>
                <p className="text-[12.5px]" style={{ color: '#8A9A8A' }}>No weekly meals set up yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {k.weeklyMeals.map((m) => (
                  <div key={m.id} className="rounded-2xl p-3 bg-white flex items-center gap-3" style={{ border: `0.5px solid ${BR}` }}>
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: D }}>
                      <span className="text-[9px] font-bold" style={{ color: A }}>{m.day}</span>
                      <span className="text-[13px] leading-none">{m.emoji}</span>
                    </div>
                    <p className="text-[12.5px] font-semibold" style={{ color: D }}>{m.name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

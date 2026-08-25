'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import KitchenCard from '@/components/KitchenCard';
import { useKitchens, todaysMeal, LiveKitchen } from '@/lib/kitchens';
import { useAuth } from '@/store/cart';

const D = '#043F28';
const A = '#FEB001';
const LT = '#FFF8E8';
const BR = '#E6E3DA';

const CHIPS = [
  { label: 'All', href: '/explore' },
  { label: 'Tiffin plans', href: '/explore?filter=tiffin' },
  { label: 'Restaurants', href: '/explore?filter=restaurant' },
];

type LiveOrder = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  kitchen?: { name: string } | null;
};

const OPEN_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY'];

const STATUS_COPY: Record<string, string> = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed by the kitchen',
  PREPARING: 'Being cooked now',
  ON_THE_WAY: 'On the way to you',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { kitchens, loading, failed } = useKitchens('Surrey');

  const [q, setQ] = useState('');
  const [orders, setOrders] = useState<LiveOrder[] | null>(null);
  const [ordersFailed, setOrdersFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/orders')
      .then(async (r) => {
        if (r.status === 401) return { orders: [] };
        if (!r.ok) throw new Error('orders');
        return r.json();
      })
      .then((d) => { if (!cancelled) setOrders(d.orders ?? []); })
      .catch(() => { if (!cancelled) setOrdersFailed(true); });
    return () => { cancelled = true; };
  }, []);

  /* Only a real, in-flight order gets a tracking strip. If there is nothing
     to track, the space stays empty rather than showing an invented driver. */
  const activeOrder = useMemo(
    () => (orders ?? []).find((o) => OPEN_STATUSES.includes(o.status)) ?? null,
    [orders]
  );

  const today = useMemo(
    () =>
      kitchens
        .map((k: LiveKitchen) => ({ kitchen: k, meal: todaysMeal(k.weeklyMeals) }))
        .filter((row) => row.meal),
    [kitchens]
  );

  const firstName = (user?.name ?? '').trim().split(' ')[0];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F5F0' }}>
      {/* header */}
      <div style={{ background: `linear-gradient(160deg, ${D}, #0A5533)` }} className="px-5 pt-12 pb-5">
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} color={A} />
          <span className="text-[12.5px] font-semibold text-white">Surrey, BC</span>
        </div>
        <h1 className="text-[22px] font-bold text-white mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>

        <form
          onSubmit={(e) => { e.preventDefault(); router.push(`/explore?q=${encodeURIComponent(q.trim())}`); }}
          className="flex items-center gap-2 rounded-2xl px-3.5 py-3 bg-white"
        >
          <Search size={16} color="#8A9A8A" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search kitchens or dishes"
            className="flex-1 text-[13.5px] outline-none bg-transparent"
            style={{ color: D }}
          />
        </form>
      </div>

      <div className="px-5 -mt-1">
        {/* chips */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-5 px-5">
          {CHIPS.map((c) => (
            <Link key={c.label} href={c.href}
              className="px-3.5 py-2 rounded-full text-[12.5px] font-medium whitespace-nowrap bg-white"
              style={{ color: D, border: `0.5px solid ${BR}` }}>
              {c.label}
            </Link>
          ))}
        </div>

        {/* live order — real ones only */}
        {activeOrder && (
          <Link href="/orders" className="block mb-5">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: D }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px]" style={{ background: A }}>🍱</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">
                  {STATUS_COPY[activeOrder.status] ?? 'In progress'}
                </p>
                <p className="text-[11.5px] truncate" style={{ color: '#C9DDD1' }}>
                  {activeOrder.kitchen?.name ?? 'Your kitchen'} · ${activeOrder.totalAmount.toFixed(2)}
                </p>
              </div>
              <ChevronRight size={16} color={A} />
            </div>
          </Link>
        )}

        {ordersFailed && (
          <div className="rounded-2xl p-3 mb-5 flex items-start gap-2" style={{ background: '#FFF4F4', border: '0.5px solid #F3D4D4' }}>
            <AlertCircle size={14} color="#B4433F" className="mt-0.5" />
            <p className="text-[11.5px] leading-relaxed" style={{ color: '#B4433F' }}>
              We could not load your orders just now. Nothing is wrong with your account — try again in a moment.
            </p>
          </div>
        )}

        {/* plan builder */}
        <Link href="/planner" className="block mb-6">
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: LT, border: `0.5px solid ${A}` }}>
            <Sparkles size={17} color="#C8941A" />
            <div className="flex-1">
              <p className="text-[13px] font-bold" style={{ color: D }}>Plan your week</p>
              <p className="text-[11.5px]" style={{ color: '#8A6A18' }}>Five days of meals from $50 — you pick, we deliver daily.</p>
            </div>
            <ChevronRight size={16} color="#C8941A" />
          </div>
        </Link>

        {/* today's meals — straight from each kitchen's real weekly calendar */}
        {today.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[15px] font-bold mb-3" style={{ color: D, fontFamily: 'Fraunces, serif' }}>
              Cooking today
            </h2>
            <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1">
              {today.map(({ kitchen, meal }) => (
                <Link key={kitchen.id} href={`/kitchen/${kitchen.id}`}
                  className="w-[210px] flex-shrink-0 rounded-2xl bg-white overflow-hidden"
                  style={{ border: `0.5px solid ${BR}` }}>
                  <div className="h-[74px] flex items-center justify-center text-[30px]" style={{ background: LT }}>
                    {meal!.emoji || '🍛'}
                  </div>
                  <div className="p-3">
                    <p className="text-[12.5px] font-bold leading-tight mb-1" style={{ color: D }}>{meal!.name}</p>
                    <p className="text-[11px] mb-2" style={{ color: '#8A9A8A' }}>{kitchen.name}</p>
                    <p className="text-[11px] font-semibold" style={{ color: '#C8941A' }}>
                      ${kitchen.pricePerMeal} · {meal!.protein} protein
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* kitchens */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>
              Kitchens in Surrey
            </h2>
            <Link href="/explore" className="text-[12px] font-semibold" style={{ color: '#C8941A' }}>See all</Link>
          </div>

          {loading && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl bg-white animate-pulse" style={{ height: 190, border: `0.5px solid ${BR}` }} />
              ))}
            </div>
          )}

          {!loading && failed && (
            <div className="rounded-2xl p-4 text-center" style={{ background: '#fff', border: `0.5px solid ${BR}` }}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: D }}>We could not load the kitchens</p>
              <p className="text-[12px]" style={{ color: '#8A9A8A' }}>This is on us, not you. Pull down to refresh in a moment.</p>
            </div>
          )}

          {!loading && !failed && kitchens.length === 0 && (
            <div className="rounded-2xl p-5 text-center" style={{ background: '#fff', border: `0.5px solid ${BR}` }}>
              <p className="text-[26px] mb-2">🍲</p>
              <p className="text-[13.5px] font-semibold mb-1" style={{ color: D }}>No kitchens open here yet</p>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: '#8A9A8A' }}>
                We are signing up kitchens in Surrey right now. Know one that should be here?
              </p>
              <Link href="/join" className="inline-block px-5 py-2.5 rounded-xl text-[12.5px] font-bold"
                style={{ background: D, color: A }}>
                Tell us about a kitchen
              </Link>
            </div>
          )}

          {!loading && !failed && kitchens.length > 0 && (
            <div className="space-y-3">
              {kitchens.map((k: LiveKitchen) => <KitchenCard key={k.id} kitchen={k} />)}
            </div>
          )}
        </section>
      </div>

      <NavBar />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, AlertCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';

const D = '#043F28';
const A = '#FEB001';
const LT = '#FFF8E8';
const BR = '#E6E3DA';

type Item = { id: string; quantity: number; price: number; menuItem?: { name: string } | null };
type Order = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  deliveryFee: number;
  address: string;
  deliverySlot?: string | null;
  mealName?: string | null;
  mealDay?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  createdAt: string;
  kitchen?: { name: string } | null;
  items: Item[];
};

const STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'] as const;

const LABEL: Record<Order['status'], string> = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed by the kitchen',
  PREPARING: 'Being cooked',
  ON_THE_WAY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function when(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/orders')
      .then(async (r) => {
        if (r.status === 401) { router.push('/auth/login?next=/orders'); return null; }
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Could not load your orders');
        return d;
      })
      .then((d) => { if (d && !cancelled) setOrders(d.orders ?? []); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F5F0' }}>
      <div style={{ background: `linear-gradient(160deg, ${D}, #0A5533)` }} className="px-5 pt-12 pb-6">
        <h1 className="text-[22px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>Your orders</h1>
      </div>

      <div className="px-5 pt-5 space-y-3">
        {!orders && !error && [0, 1].map((i) => (
          <div key={i} className="rounded-2xl bg-white animate-pulse" style={{ height: 130, border: `0.5px solid ${BR}` }} />
        ))}

        {error && (
          <div className="rounded-2xl p-4 flex items-start gap-2.5" style={{ background: '#FFF4F4', border: '0.5px solid #F3D4D4' }}>
            <AlertCircle size={15} color="#B4433F" className="mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#B4433F' }}>{error}</p>
              <p className="text-[11.5px]" style={{ color: '#A06561' }}>
                This is a problem on our side. Your orders are safe — try again in a moment.
              </p>
            </div>
          </div>
        )}

        {orders?.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#fff', border: `0.5px solid ${BR}` }}>
            <p className="text-[28px] mb-2">🍱</p>
            <p className="text-[14px] font-bold mb-1" style={{ color: D }}>No orders yet</p>
            <p className="text-[12.5px] leading-relaxed mb-5" style={{ color: '#8A9A8A' }}>
              When you order a meal or start a weekly plan, you will be able to follow it here.
            </p>
            <Link href="/explore" className="inline-block px-6 py-3 rounded-2xl text-[13px] font-bold"
              style={{ background: D, color: A }}>
              Browse this week&rsquo;s menus
            </Link>
          </div>
        )}

        {orders?.map((o) => {
          const stepIndex = STEPS.indexOf(o.status as typeof STEPS[number]);
          const live = stepIndex >= 0 && o.status !== 'DELIVERED';
          return (
            <div key={o.id} className="rounded-2xl bg-white p-4" style={{ border: `0.5px solid ${BR}` }}>
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold truncate" style={{ color: D }}>
                    {o.kitchen?.name ?? 'Kitchen'}
                  </p>
                  <p className="text-[11.5px]" style={{ color: '#8A9A8A' }}>{when(o.createdAt)}</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: o.status === 'CANCELLED' ? '#FBEAEA' : LT,
                    color: o.status === 'CANCELLED' ? '#B4433F' : '#C8941A',
                  }}>
                  {LABEL[o.status]}
                </span>
              </div>

              <p className="text-[12.5px] mb-3" style={{ color: '#5A6B5A' }}>
                {o.mealName ||
                  o.items.map((i) => `${i.quantity}× ${i.menuItem?.name ?? 'Item'}`).join(', ') ||
                  'Weekly plan'}
              </p>

              {/* progress — only for orders actually in flight */}
              {live && (
                <div className="flex gap-1 mb-3">
                  {STEPS.slice(0, 4).map((s, i) => (
                    <div key={s} className="flex-1 h-1 rounded-full"
                      style={{ background: i <= stepIndex ? A : '#EDEBE4' }} />
                  ))}
                </div>
              )}

              {/* a driver is shown only when one is actually assigned */}
              {o.driverName && (
                <div className="flex items-center gap-2.5 rounded-xl p-2.5 mb-3" style={{ background: '#F7F6F2' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                    style={{ background: D, color: A }}>
                    {o.driverName.slice(0, 1).toUpperCase()}
                  </div>
                  <p className="flex-1 text-[12.5px] font-medium" style={{ color: D }}>{o.driverName}</p>
                  {o.driverPhone && (
                    <a href={`tel:${o.driverPhone}`} className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: LT }} aria-label="Call the driver">
                      <Phone size={13} color="#C8941A" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5" style={{ borderTop: `0.5px solid ${BR}` }}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin size={12} color="#8A9A8A" />
                  <span className="text-[11.5px] truncate" style={{ color: '#8A9A8A' }}>
                    {o.address}{o.deliverySlot ? ` · ${o.deliverySlot}` : ''}
                  </span>
                </div>
                <span className="text-[13px] font-bold whitespace-nowrap" style={{ color: D }}>
                  ${o.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <NavBar />
    </div>
  );
}

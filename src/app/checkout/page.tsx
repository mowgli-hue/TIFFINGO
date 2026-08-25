'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useKitchen } from '@/lib/kitchens';
import { DELIVERY_SLOTS } from '@/lib/mock-data';
import { toast } from 'react-hot-toast';

const D = '#043F28', A = '#FEB001', LT = '#FFF8E8', BR = '#E6E3DA';

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

/* Inner form — mounts only once we hold a clientSecret for the hold. */
function PayForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { return_url: `${window.location.origin}/confirmation?orderId=${orderId}` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || 'Your card was not accepted.');
      return;
    }
    router.push(`/confirmation?orderId=${orderId}`);
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button onClick={pay} disabled={busy || !stripe}
        className="w-full py-4 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: D, color: A }}>
        <Lock size={13} /> {busy ? 'Placing hold…' : `Place hold — $${amount.toFixed(2)}`}
      </button>
      <p className="text-[11px] leading-relaxed text-center" style={{ color: '#8A9A8A' }}>
        This is a hold, not a charge. Your card is charged only when the kitchen
        confirms your week at the 8pm cutoff — if they can&rsquo;t cook it, the hold
        is released and you pay nothing.
      </p>
    </div>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get('kitchenId') ?? '';
  const { kitchen } = useKitchen(kitchenId || undefined);

  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState(DELIVERY_SLOTS[0]);
  const [starting, setStarting] = useState(false);
  const [pay, setPay] = useState<{ clientSecret: string; orderId: string; amount: number } | null>(null);

  async function start() {
    if (address.trim().length < 10) { toast.error('Add your delivery address first'); return; }
    setStarting(true);
    try {
      const r = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchenId, type: 'weekly', address: address.trim(), deliverySlot: slot }),
      });
      if (r.status === 401) { router.push(`/auth/login?next=/checkout?kitchenId=${kitchenId}`); return; }
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || 'Could not start the payment'); return; }
      setPay({ clientSecret: d.clientSecret, orderId: d.orderId, amount: d.amount });
    } catch {
      toast.error('Could not reach payments — try again');
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F5F5F0' }}>
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Back"
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center" style={{ border: `0.5px solid ${BR}` }}>
          <ArrowLeft size={14} color={D} />
        </button>
        <h1 className="text-[19px] font-bold" style={{ color: D, fontFamily: 'Fraunces, serif' }}>Checkout</h1>
      </div>

      <div className="px-5 space-y-4 max-w-lg mx-auto">
        {/* summary */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: `0.5px solid ${BR}` }}>
          <div className="flex items-center gap-3 pb-3 mb-3" style={{ borderBottom: `0.5px solid ${BR}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: LT }}>🍛</div>
            <div>
              <p className="text-[13.5px] font-bold" style={{ color: D }}>{kitchen?.name ?? 'Kitchen'}</p>
              <p className="text-[11.5px]" style={{ color: '#8A9A8A' }}>Weekly plan · 5 meals, Mon–Fri</p>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] font-medium" style={{ color: D }}>Weekly total</span>
            <span className="text-[16px] font-bold" style={{ color: D }}>
              ${(pay?.amount ?? kitchen?.weeklyPrice ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* delivery */}
        {!pay && (
          <div className="rounded-2xl p-4 bg-white space-y-3" style={{ border: `0.5px solid ${BR}` }}>
            <p className="text-[11px] font-bold" style={{ color: '#5A6B5A' }}>DELIVERY</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: LT }}>
                <MapPin size={14} color={D} />
              </div>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, unit, city"
                className="flex-1 rounded-xl px-3 py-2.5 text-[12.5px] outline-none"
                style={{ border: `0.5px solid ${BR}`, color: D }} />
            </div>
            <div className="flex gap-2">
              {DELIVERY_SLOTS.map((s) => (
                <button key={s} onClick={() => setSlot(s)}
                  className="flex-1 rounded-xl py-2.5 text-[11.5px] font-medium"
                  style={slot === s
                    ? { background: LT, border: `0.5px solid ${D}`, color: D }
                    : { background: '#F1EFE8', border: '0.5px solid transparent', color: '#5A6B5A' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* payment */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: `0.5px solid ${BR}` }}>
          <p className="text-[11px] font-bold mb-3" style={{ color: '#5A6B5A' }}>PAYMENT</p>

          {!PK && (
            <p className="text-[12px] leading-relaxed" style={{ color: '#8A9A8A' }}>
              Card payments are almost here. Until then, confirming reserves your
              plan without charging you — the kitchen arranges payment for your
              first week directly.
            </p>
          )}

          {PK && !pay && (
            <button onClick={start} disabled={starting}
              className="w-full py-4 rounded-2xl text-[14px] font-bold disabled:opacity-60"
              style={{ background: D, color: A }}>
              {starting ? 'Setting up…' : 'Continue to card'}
            </button>
          )}

          {PK && pay && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret: pay.clientSecret }}>
              <PayForm orderId={pay.orderId} amount={pay.amount} />
            </Elements>
          )}
        </div>

        {!PK && (
          <button
            onClick={() => {
              if (address.trim().length < 10) { toast.error('Add your delivery address first'); return; }
              toast.success('Plan reserved — the kitchen will confirm payment with you.');
              router.push(`/confirmation?kitchenId=${kitchenId}`);
            }}
            className="w-full py-4 rounded-2xl text-[14px] font-bold"
            style={{ background: A, color: D }}>
            Reserve my plan
          </button>
        )}

        <div className="flex justify-center gap-5 pt-1">
          {['Hold now, charge at cutoff', 'Cancel anytime'].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: D }} />
              <span className="text-[10px]" style={{ color: '#8A9A8A' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}><p style={{ color: '#8A9A8A' }}>Loading…</p></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

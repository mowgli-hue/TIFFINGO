'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { useCart } from '@/store/cart';
import { DELIVERY_SLOTS } from '@/lib/mock-data';
import { useKitchen } from '@/lib/kitchens';
import { PLANS } from '@/lib/stripe';
import PlanCard from '@/components/PlanCard';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const STEPS = ['Plan', 'Delivery', 'Payment'] as const;


function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get('kitchenId') ?? '';
  const { kitchen } = useKitchen(kitchenId || undefined);

  const { selectedPlan, setPlan, selectedDays, setDays } = useCart();
  const [step, setStep] = useState<0 | 1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const plan = selectedPlan ?? 'WEEKLY';
  const planData = PLANS[plan];
  const regularPrice = planData.mealsPerWeek * (kitchen?.pricePerMeal ?? 9);
  const discount = regularPrice - planData.pricePerWeek;

  async function handleConfirm() {
    if (address.trim().length < 10) {
      toast.error('Add your delivery address first');
      return;
    }
    setLoading(true);
    // Payments are not live yet (C2). This reserves the plan; it does not charge.
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    toast.success('Plan reserved — the kitchen will confirm payment with you.');
    router.push(`/confirmation?kitchenId=${kitchenId}&plan=${plan}`);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-8">
      {/* Header */}
      <div className="bg-[#F5F5F0] px-5 pt-14 pb-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-[#D8DDD0] rounded-full flex items-center justify-center">
          <ArrowLeft size={14} className="text-[#1A3A2A]" />
        </button>
        <h1 className="font-serif text-[19px] text-[#1A3A2A]">Checkout</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 pb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5">
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium',
                i < step ? 'bg-[#8A9A8A]' : i === step ? 'bg-[#1A3A2A] text-white' : 'bg-[#F1EFE8] text-[#8A9A8A]'
              )}>
                {i < step
                  ? <Check size={11} className="text-white" />
                  : i + 1}
              </div>
              <span className={clsx('text-[10px] font-medium', i === step ? 'text-[#1A3A2A]' : i < step ? 'text-[#1A3A2A]' : 'text-[#B4B2A9]')}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#D8DDD0] mx-2" />}
          </div>
        ))}
      </div>

      <div className="border-t border-[#D8DDD0]" />

      <div className="px-5 py-4 space-y-4">
        {/* Plan summary */}
        <div>
          <p className="text-[11px] font-medium text-[#8A9A8A] tracking-wider mb-2.5">YOUR PLAN</p>
          <div className="card p-3.5">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#F1EFE8]">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-xl">🍛</div>
              <div>
                <p className="text-[13px] font-medium text-[#1A3A2A]">{kitchen?.name ?? 'Kitchen'}</p>
                <p className="text-[11px] text-[#8A9A8A]">{plan.charAt(0) + plan.slice(1).toLowerCase()} plan · {planData.mealsPerWeek} meals</p>
              </div>
            </div>

            {[
              { label: 'Regular price', value: `$${regularPrice.toFixed(2)}/wk`, strike: true },
              { label: 'Subscription discount', value: `-$${discount.toFixed(2)}`, green: true },
              { label: 'Delivery', value: 'Free', green: true },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-[12px] mb-1.5">
                <span className="text-[#5F5E5A]">{row.label}</span>
                <span className={clsx(row.strike && 'line-through text-[#B4B2A9]', row.green && 'text-[#1A3A2A] font-medium')}>
                  {row.value}
                </span>
              </div>
            ))}

            <div className="flex justify-between pt-2.5 mt-1.5 border-t border-[#D8DDD0]">
              <span className="text-[13px] font-medium text-[#1A3A2A]">Weekly total</span>
              <span className="text-[16px] font-medium text-[#1A3A2A]">${planData.pricePerWeek.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div>
          <p className="text-[11px] font-medium text-[#8A9A8A] tracking-wider mb-2.5">DELIVERY ADDRESS</p>
          <div className="card p-3.5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-[#1A3A2A]" />
              </div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, unit, city — e.g. 10245 King George Blvd, Surrey"
                className="flex-1 border border-[#D8DDD0] rounded-xl px-3 py-2.5 text-[12.5px] text-[#1A3A2A] outline-none"
              />
            </div>

            <p className="text-[11px] font-medium text-[#8A9A8A] tracking-wider mb-2">DELIVERY SCHEDULE</p>
            <div className="flex gap-1.5">
              {DELIVERY_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    const next = selectedDays.includes(slot)
                      ? selectedDays.filter(d => d !== slot)
                      : [...selectedDays, slot];
                    if (next.length > 0) setDays(next);
                  }}
                  className={clsx(
                    'flex-1 rounded-xl py-2 text-center transition-all',
                    selectedDays.includes(slot)
                      ? 'bg-[#FFFBEB] border border-[#1A3A2A]'
                      : 'bg-[#F1EFE8] border border-transparent'
                  )}
                >
                  <p className={clsx('text-[10px] font-medium', selectedDays.includes(slot) ? 'text-[#0F6E56]' : 'text-[#5F5E5A]')}>{slot}</p>
                  <p className={clsx('text-[9px] mt-0.5', selectedDays.includes(slot) ? 'text-[#5DCAA5]' : 'text-[#8A9A8A]')}>{slot}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment */}
        <div>
          <p className="text-[11px] font-medium text-[#8A9A8A] tracking-wider mb-2.5">PAYMENT</p>
          <div className="card p-3.5">
            <p className="text-[12.5px] font-medium text-[#1A3A2A] mb-1">Card payments are almost here</p>
            <p className="text-[11.5px] text-[#8A9A8A] leading-relaxed">
              While we finish setting up payments, confirming reserves your plan without charging you.
              The kitchen will contact you to arrange payment for your first week.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3.5 bg-[#1A3A2A] text-white rounded-2xl text-[14px] font-medium flex items-center justify-between px-5 disabled:opacity-60"
        >
          <span>{loading ? 'Reserving…' : 'Reserve my plan'}</span>
          <span className="text-[#FFD166] text-[12px]">${planData.pricePerWeek.toFixed(2)}/week</span>
        </button>

        <div className="flex justify-center gap-5 mt-3">
          {['Cancel anytime', 'Pause anytime', 'No charge today'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A2A]" />
              <span className="text-[10px] text-[#8A9A8A]">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><p className="text-[#888780]">Loading...</p></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

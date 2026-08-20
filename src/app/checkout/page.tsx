'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { useCart } from '@/store/cart';
import { MOCK_KITCHENS, DELIVERY_SLOTS } from '@/lib/mock-data';
import { PLANS } from '@/lib/stripe';
import PlanCard from '@/components/PlanCard';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const STEPS = ['Plan', 'Delivery', 'Payment'] as const;

const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa ending 4242', sub: 'Expires 09/27', icon: 'VISA' },
  { id: 'apple', label: 'Apple Pay', sub: 'Touch ID to confirm', icon: '🍎' },
  { id: 'new', label: 'Add new card', sub: 'Credit or debit', icon: '+' },
];

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get('kitchenId') ?? '';
  const kitchen = MOCK_KITCHENS.find(k => k.id === kitchenId);

  const { selectedPlan, setPlan, selectedDays, setDays } = useCart();
  const [step, setStep] = useState<0 | 1 | 2>(1);
  const [payMethod, setPayMethod] = useState('visa');
  const [loading, setLoading] = useState(false);
  const [address] = useState('123 Main Street, Apt 4B, Vancouver BC');

  const plan = selectedPlan ?? 'WEEKLY';
  const planData = PLANS[plan];
  const regularPrice = planData.mealsPerWeek * (kitchen?.pricePerMeal ?? 9);
  const discount = regularPrice - planData.pricePerWeek;

  async function handleConfirm() {
    setLoading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Subscription confirmed!');
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center">
                  <MapPin size={14} className="text-[#1A3A2A]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1A3A2A]">123 Main Street, Apt 4B</p>
                  <p className="text-[11px] text-[#8A9A8A]">Vancouver, BC · V6B 1A1</p>
                </div>
              </div>
              <button className="text-[11px] text-[#1A3A2A] font-medium">Change</button>
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
          <div className="card overflow-hidden">
            {PAYMENT_METHODS.map((pm, i) => (
              <button
                key={pm.id}
                onClick={() => setPayMethod(pm.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3.5 py-3 text-left transition-all',
                  i < PAYMENT_METHODS.length - 1 && 'border-b border-[#F1EFE8]',
                  payMethod === pm.id && 'bg-[#FFF8F4]'
                )}
              >
                <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center', payMethod === pm.id ? 'border-[#1A3A2A]' : 'border-[#D3D1C7]')}>
                  {payMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1A3A2A]" />}
                </div>
                <div className="w-9 h-6 rounded bg-[#F1EFE8] flex items-center justify-center text-[10px] font-medium text-[#5F5E5A] border border-[#D8DDD0]">
                  {pm.icon}
                </div>
                <div>
                  <p className="text-[13px] text-[#1A3A2A]">{pm.label}</p>
                  <p className="text-[11px] text-[#8A9A8A]">{pm.sub}</p>
                </div>
              </button>
            ))}
            {payMethod === 'new' && (
              <div className="flex gap-2 px-3.5 py-3 border-t border-[#F1EFE8]">
                <input placeholder="Card number" className="flex-[2] border border-[#D8DDD0] rounded-xl px-3 py-2 text-[12px]" />
                <input placeholder="MM/YY" className="flex-1 border border-[#D8DDD0] rounded-xl px-3 py-2 text-[12px]" />
                <input placeholder="CVV" className="w-14 border border-[#D8DDD0] rounded-xl px-3 py-2 text-[12px]" />
              </div>
            )}
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
          <span>{loading ? 'Processing...' : 'Confirm subscription'}</span>
          <span className="text-[#FFD166] text-[12px]">${planData.pricePerWeek.toFixed(2)}/week</span>
        </button>

        <div className="flex justify-center gap-5 mt-3">
          {['Cancel anytime', 'Pause anytime', 'Secure checkout'].map(t => (
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

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, MapPin, Clock, DollarSign, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const STEPS = ['Your kitchen', 'Your menu', 'Payouts', 'Go live'];

const CUISINES = ['Indian', 'Punjabi', 'Pakistani', 'South Indian', 'Chinese', 'Healthy', 'Fusion', 'Other'];

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', cuisine: '', type: 'tiffin',
    address: '', city: 'Surrey', phone: '', email: '',
    isHalal: false, isVeg: false,
    pricePerMeal: '12', weeklyPrice: '50',
    cutoffTime: '8:00pm', deliverySlots: ['12:00pm – 1:00pm'],
    bankName: '', accountNum: '', transitNum: '',
    signature: '', agree: false,
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function handleSubmit() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    toast.success('Application submitted! We\'ll be in touch within 24 hours.');
    router.push('/join/success');
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Header */}
      <div style={{ background: '#1A3A2A' }} className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0B429' }}>
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-white">Join TiffinGo</h1>
            <p className="text-[11px] text-gray-400">Start selling in under 10 minutes</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all"
                  style={{ background: i <= step ? '#F0B429' : '#333330', color: i <= step ? '#fff' : '#666' }}>
                  {i < step ? <Check size={11} /> : i + 1}
                </div>
                <span className="text-[10px] font-medium" style={{ color: i === step ? '#F0B429' : i < step ? '#9FE1CB' : '#666' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px mx-2" style={{ background: i < step ? '#F0B429' : '#333' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto">

        {/* Step 0 — Kitchen info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">KITCHEN NAME</p>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Ghar Ka Khana" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">TAGLINE</p>
              <input value={form.tagline} onChange={set('tagline')} placeholder="e.g. Home cooking. Nothing more." className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">CUISINE TYPE</p>
                <select value={form.cuisine} onChange={set('cuisine')} className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white">
                  <option value="">Select...</option>
                  {CUISINES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">KITCHEN TYPE</p>
                <select value={form.type} onChange={set('type')} className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white">
                  <option value="tiffin">Home kitchen</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">ADDRESS</p>
              <input value={form.address} onChange={set('address')} placeholder="123 Main St, Surrey, BC" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">PHONE</p>
                <input value={form.phone} onChange={set('phone')} placeholder="+1 604 000 0000" type="tel" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">EMAIL</p>
                <input value={form.email} onChange={set('email')} placeholder="you@example.com" type="email" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHalal} onChange={set('isHalal')} className="w-4 h-4 rounded accent-orange-500" />
                <span className="text-[13px] text-[#1A3A2A]">Halal certified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVeg} onChange={set('isVeg')} className="w-4 h-4 rounded" />
                <span className="text-[13px] text-[#1A3A2A]">Vegetarian only</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 1 — Menu & pricing */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white border border-[#EAEAE5] rounded-2xl p-4">
              <p className="text-[13px] font-medium text-[#1A3A2A] mb-1">How does TiffinGo pricing work?</p>
              <p className="text-[12px] text-[#6B6B68] leading-relaxed">You set the meal price. TiffinGo takes 10% commission. The rest goes to you every Sunday. For weekly packages we suggest a 15-20% discount to encourage subscriptions.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">PRICE PER MEAL ($)</p>
                <input value={form.pricePerMeal} onChange={set('pricePerMeal')} type="number" placeholder="12" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">WEEKLY PACKAGE ($)</p>
                <input value={form.weeklyPrice} onChange={set('weeklyPrice')} type="number" placeholder="50" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">ORDER CUTOFF TIME</p>
              <select value={form.cutoffTime} onChange={set('cutoffTime')} className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white">
                <option>6:00pm</option>
                <option>7:00pm</option>
                <option>8:00pm</option>
                <option>9:00pm</option>
              </select>
              <p className="text-[11px] text-[#6B6B68] mt-1.5">Customers must order before this time for next-day delivery</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-2 tracking-wide">DELIVERY SLOTS</p>
              <div className="flex gap-2">
                {['12:00pm – 1:00pm', '5:00pm – 6:00pm', '6:00pm – 7:00pm'].map(slot => {
                  const active = form.deliverySlots.includes(slot);
                  return (
                    <button key={slot} type="button"
                      onClick={() => setForm(f => ({ ...f, deliverySlots: active ? f.deliverySlots.filter(s => s !== slot) : [...f.deliverySlots, slot] }))}
                      className="flex-1 py-2.5 rounded-xl text-[11px] font-medium border transition-all"
                      style={{ background: active ? '#F0B429' : '#F5F0E8', color: active ? '#fff' : '#6B6B68', borderColor: active ? '#F0B429' : 'transparent' }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#FFFBEB] border border-[#F0B429]/30 rounded-2xl p-4">
              <p className="text-[12px] font-medium text-[#C8941A] mb-1">Your estimated weekly earnings</p>
              <p className="text-[24px] font-semibold text-[#1A3A2A]">
                ${Math.round(Number(form.weeklyPrice) * 0.9 * 4).toLocaleString()}
                <span className="text-[13px] font-normal text-[#6B6B68]">/month</span>
              </p>
              <p className="text-[11px] text-[#6B6B68] mt-1">Based on {form.weeklyPrice}/week × 4 weeks × 90% (after 10% commission)</p>
            </div>
          </div>
        )}

        {/* Step 2 — Bank details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white border border-[#EAEAE5] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-[#F0B429]" />
                <p className="text-[13px] font-medium text-[#1A3A2A]">Automatic weekly payouts</p>
              </div>
              <p className="text-[12px] text-[#6B6B68] leading-relaxed">Every Sunday, TiffinGo automatically deposits your earnings directly to your bank account. No invoices, no chasing payments.</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">BANK NAME</p>
              <input value={form.bankName} onChange={set('bankName')} placeholder="e.g. RBC, TD, Scotiabank" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">TRANSIT NUMBER</p>
                <input value={form.transitNum} onChange={set('transitNum')} placeholder="12345" maxLength={5} className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white font-mono" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#6B6B68] mb-1.5 tracking-wide">ACCOUNT NUMBER</p>
                <input value={form.accountNum} onChange={set('accountNum')} placeholder="1234567" className="w-full border border-[#EAEAE5] rounded-2xl px-4 py-3 text-[14px] bg-white font-mono" />
              </div>
            </div>
            <div className="bg-[#E3F5EE] border border-[#2D9B6F]/30 rounded-2xl p-4">
              <p className="text-[12px] font-medium text-[#2D9B6F] mb-1">🔒 Your data is secure</p>
              <p className="text-[11px] text-[#2D9B6F]/80 leading-relaxed">Bank details are encrypted and processed through Stripe. TiffinGo never stores your full account information.</p>
            </div>
          </div>
        )}

        {/* Step 3 — Agreement & go live */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white border border-[#EAEAE5] rounded-2xl p-4 space-y-3">
              <p className="text-[14px] font-semibold text-[#1A3A2A]">Partnership agreement</p>
              {[
                { icon: '💰', title: '10% commission', desc: 'TiffinGo takes 10% of each order. You keep 90%. Paid every Sunday.' },
                { icon: '🎁', title: '0% for first 90 days', desc: 'As a launch partner, you pay zero commission for your first 3 months.' },
                { icon: '📅', title: 'Weekly meal calendar', desc: 'You set your meals for the week. Customers order by your cutoff time.' },
                { icon: '🛵', title: 'We handle delivery', desc: 'TiffinGo manages all drivers and delivery logistics. You just cook.' },
                { icon: '❌', title: 'Cancel anytime', desc: 'No lock-in. Give 7 days notice and you can leave the platform.' },
              ].map(t => (
                <div key={t.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{t.icon}</span>
                  <div>
                    <p className="text-[12px] font-medium text-[#1A3A2A]">{t.title}</p>
                    <p className="text-[11px] text-[#6B6B68]">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agree} onChange={set('agree')} className="w-4 h-4 mt-0.5 rounded" />
              <p className="text-[12px] text-[#6B6B68] leading-relaxed">I agree to TiffinGo's merchant terms and confirm the information I've provided is accurate.</p>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3.5 border border-[#EAEAE5] rounded-2xl text-[13px] font-medium text-[#6B6B68] bg-white">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: '#F0B429' }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.agree || loading}
              className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: loading ? '#F0B429' : '#1A3A2A' }}>
              {loading ? 'Submitting...' : 'Submit & go live 🚀'}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-[#AEAEAD] mt-4">
          Already a merchant? <Link href="/dashboard" className="text-[#F0B429] font-medium">Go to dashboard</Link>
        </p>
      </div>
    </div>
  );
}

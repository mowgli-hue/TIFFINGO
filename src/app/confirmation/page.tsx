'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { MOCK_KITCHENS } from '@/lib/mock-data';
import { PLANS } from '@/lib/stripe';
import { useCart } from '@/store/cart';
import clsx from 'clsx';

const GOALS = ['Lose weight', 'Build muscle', 'Eat healthier', 'Diabetic-friendly', 'High protein', 'Low carb', 'Vegan', 'Halal only'];

function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kitchenId = searchParams.get('kitchenId') ?? '';
  const plan = (searchParams.get('plan') ?? 'WEEKLY') as keyof typeof PLANS;
  const kitchen = MOCK_KITCHENS.find(k => k.id === kitchenId);
  const planData = PLANS[plan];
  const { clearCart, selectedDays } = useCart();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { clearCart(); }, []);

  // Confetti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const pieces = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 3,
      r: Math.random() * Math.PI * 2,
      dr: (Math.random() - 0.5) * 0.1,
      dy: 1.5 + Math.random() * 1.5,
      dx: (Math.random() - 0.5) * 0.8,
      color: ['#9FE1CB', '#1D9E75', '#EF9F27', '#ffffff', '#5DCAA5'][Math.floor(Math.random() * 5)],
    }));
    let running = true;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.dy; p.x += p.dx; p.r += p.dr;
        if (p.y > canvas!.height) { p.y = -10; p.x = Math.random() * canvas!.width; }
      });
      requestAnimationFrame(draw);
    }
    draw();
    const t = setTimeout(() => { running = false; ctx.clearRect(0, 0, canvas!.width, canvas!.height); }, 4000);
    return () => { running = false; clearTimeout(t); };
  }, []);

  // Next 3 delivery dates
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const nextDates = (selectedDays.length > 0 ? [selectedDays[0]] : ['Wed']).flatMap(day => {
    const target = dayMap[day] ?? 3;
    const dates = [];
    const d = new Date();
    for (let i = 0; i < 21 && dates.length < 3; i++) {
      const next = new Date(d);
      next.setDate(d.getDate() + i + 1);
      if (next.getDay() === target) dates.push(next);
    }
    return dates;
  }).slice(0, 3);

  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-10">
      {/* Hero */}
      <div className="bg-[#2C1810] relative overflow-hidden pt-16 pb-8 px-5 text-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-[#C8522A] flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 rounded-full bg-[#C8522A] flex items-center justify-center animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h1 className="font-serif text-[22px] text-white mb-1.5">
            You&apos;re all set!
          </h1>
          <p className="text-[12px] text-[#9A8A7A]">{kitchen?.name} · {plan.charAt(0) + plan.slice(1).toLowerCase()} plan confirmed</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex border-b border-[#E8DDD0] bg-white">
        {[
          { val: planData.mealsPerWeek.toString(), label: 'meals/week' },
          { val: `$${planData.pricePerWeek}`, label: 'per week', green: true },
          { val: `${planData.savingsPct}%`, label: 'saved', green: true },
          { val: 'Free', label: 'delivery' },
        ].map(({ val, label, green }) => (
          <div key={label} className="flex-1 text-center py-3 border-r border-[#E8DDD0] last:border-r-0">
            <p className={clsx('text-[14px] font-medium', green ? 'text-[#C8522A]' : 'text-[#2C1810]')}>{val}</p>
            <p className="text-[10px] text-[#9A8A7A] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Upcoming deliveries */}
        <div>
          <p className="text-[11px] font-medium text-[#9A8A7A] tracking-wider mb-2.5">UPCOMING DELIVERIES</p>
          <div className="card p-3.5">
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#F1EFE8]">
              <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="2" stroke="#1D9E75" strokeWidth="1.2"/><path d="M4 2V1M10 2V1M1 6h12" stroke="#1D9E75" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#2C1810]">First delivery</p>
                <p className="text-[11px] text-[#9A8A7A]">{nextDates[0] ? fmt(nextDates[0]) : 'This week'} · 12–1pm</p>
              </div>
            </div>
            <div className="flex gap-2">
              {nextDates.map((d, i) => (
                <div key={i} className="flex-1 bg-[#FFF8F4] border border-[#FFD166] rounded-xl py-2 text-center">
                  <p className="text-[11px] font-medium text-[#0F6E56]">{fmt(d)}</p>
                  <p className="text-[10px] text-[#5DCAA5] mt-0.5">12–1pm</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Meal Planner upsell */}
        <div className="border border-[#C8522A] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#FFF0E6] opacity-60" />
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8522A] animate-pulse" />
            <span className="text-[9px] font-medium text-[#0F6E56] tracking-wider">AI MEAL PLANNER</span>
          </div>
          <h3 className="text-[14px] font-medium text-[#2C1810] mb-1">Set your nutrition goals</h3>
          <p className="text-[11px] text-[#5F5E5A] mb-3 leading-relaxed">
            Tell us what you&apos;re working toward — your AI planner will customise every weekly tiffin around it.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {GOALS.map(g => (
              <button key={g} className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#E8DDD0] text-[#5F5E5A] bg-white hover:bg-[#2C1810] hover:text-white hover:border-[#2C1810] transition-all">
                {g}
              </button>
            ))}
          </div>
          <Link href="/planner">
            <button className="w-full py-2.5 bg-[#C8522A] text-white rounded-xl text-[13px] font-medium">
              Personalise my plan →
            </button>
          </Link>
          <button className="w-full text-[11px] text-[#B4B2A9] py-2">Skip for now</button>
        </div>
      </div>

      {/* Home button */}
      <div className="px-5">
        <Link href="/">
          <button className="w-full py-3.5 bg-[#2C1810] text-white rounded-2xl text-[13px] font-medium flex items-center justify-center gap-2">
            <Home size={15} />
            Back to home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><p className="text-[#888780]">Loading...</p></div>}>
      <ConfirmationPage />
    </Suspense>
  );
}

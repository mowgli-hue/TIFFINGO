'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, RefreshCw, AlertCircle, Flame, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useKitchens, useKitchen, withDates, todaysMeal, LiveKitchen } from '@/lib/kitchens';
import { usePrefs } from '@/store/cart';
import { toast } from 'react-hot-toast';

const D = '#043F28', A = '#FEB001', LT = '#FFF8E8', BR = '#E6E3DA';

const TARGETS = [
  { cal: 1500, label: 'Light', sub: '~1,500 cal/day' },
  { cal: 2000, label: 'Balanced', sub: '~2,000 cal/day' },
  { cal: 2500, label: 'Fuel up', sub: '~2,500 cal/day' },
];
const DIETS = ['No preference', 'Vegetarian', 'Non-veg heavy'];
const GOALS = ['Balanced', 'High protein', 'Light & fresh', 'Comfort food'];

type Sub = {
  id: string; kitchenId: string; status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  pricePerWeek: number; deliveryTime: string;
  kitchen?: { name: string } | null;
};
type PlanDay = { day: string; emoji: string; items: string[]; name: string; description: string; calories: number; protein: string; price: number };
type Plan = { days: PlanDay[]; subtotal: number; discountPct: number; total: number };

function calLine(cal: number, target: number): string {
  return `${cal} cal · ≈${Math.round((cal / target) * 100)}% of your ${target.toLocaleString()} cal day`;
}

/* ------------------------------------------------------------------ */
/* My plan — shown when a real subscription exists                     */
/* ------------------------------------------------------------------ */

function MyPlan({ sub, onChanged }: { sub: Sub; onChanged: () => void }) {
  const { kitchen } = useKitchen(sub.kitchenId);
  const { calorieTarget } = usePrefs();
  const [busy, setBusy] = useState(false);

  const meals = useMemo(() => (kitchen ? withDates(kitchen.weeklyMeals) : []), [kitchen]);
  const today = useMemo(() => todaysMeal(kitchen?.weeklyMeals ?? []), [kitchen]);
  const avgCal = meals.length ? Math.round(meals.reduce((s, m) => s + (m.calories ?? 0), 0) / meals.length) : 0;

  async function act(action: 'pause' | 'resume' | 'cancel') {
    if (action === 'cancel' && !confirm('Cancel this plan? Deliveries stop after this week.')) return;
    setBusy(true);
    try {
      const r = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sub.id, action }),
      });
      if (!r.ok) throw new Error();
      toast.success(action === 'pause' ? 'Plan paused' : action === 'resume' ? 'Plan resumed' : 'Plan cancelled');
      onChanged();
    } catch {
      toast.error('That did not go through — your plan is unchanged.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: D }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[15px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
            {sub.kitchen?.name ?? kitchen?.name ?? 'Your plan'}
          </p>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: sub.status === 'ACTIVE' ? A : '#EDEBE4', color: D }}>
            {sub.status === 'ACTIVE' ? 'Active' : 'Paused'}
          </span>
        </div>
        <p className="text-[12px]" style={{ color: '#C9DDD1' }}>
          ${sub.pricePerWeek}/week · delivered {sub.deliveryTime}
          {avgCal ? ` · avg ${avgCal} cal/meal` : ''}
        </p>
      </div>

      {today && sub.status === 'ACTIVE' && (
        <div className="rounded-2xl p-4 flex items-center gap-3 bg-white" style={{ border: `0.5px solid ${A}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px]" style={{ background: LT }}>
            {today.emoji || '🍛'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold mb-0.5" style={{ color: '#C8941A' }}>COMING TODAY</p>
            <p className="text-[13.5px] font-bold leading-tight" style={{ color: D }}>{today.name}</p>
            <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: '#8A9A8A' }}>
              <Flame size={11} color="#C8941A" /> {calLine(today.calories ?? 0, calorieTarget)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {meals.map((m) => (
          <div key={m.day} className="rounded-2xl p-3 bg-white flex items-center gap-3" style={{ border: `0.5px solid ${BR}` }}>
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: D }}>
              <span className="text-[8.5px] font-bold" style={{ color: A }}>{m.day}</span>
              <span className="text-[13px] leading-none">{m.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold leading-tight" style={{ color: D }}>{m.name}</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: '#8A9A8A' }}>
                {m.calories} cal · {m.protein} protein
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {sub.status === 'ACTIVE' ? (
          <button onClick={() => act('pause')} disabled={busy}
            className="flex-1 py-3 rounded-2xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 bg-white disabled:opacity-50"
            style={{ color: D, border: `0.5px solid ${BR}` }}>
            <PauseCircle size={14} /> Pause a week
          </button>
        ) : (
          <button onClick={() => act('resume')} disabled={busy}
            className="flex-1 py-3 rounded-2xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: D, color: A }}>
            <PlayCircle size={14} /> Resume
          </button>
        )}
        <button onClick={() => act('cancel')} disabled={busy}
          className="flex-1 py-3 rounded-2xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 bg-white disabled:opacity-50"
          style={{ color: '#B4433F', border: '0.5px solid #F3D4D4' }}>
          <XCircle size={14} /> Cancel plan
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Builder — no plan yet                                               */
/* ------------------------------------------------------------------ */

function Builder({ kitchens }: { kitchens: LiveKitchen[] }) {
  const router = useRouter();
  const { calorieTarget, setCalorieTarget } = usePrefs();
  const [kitchenId, setKitchenId] = useState(kitchens[0]?.id ?? '');
  const [diet, setDiet] = useState(DIETS[0]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!kitchenId && kitchens[0]) setKitchenId(kitchens[0].id); }, [kitchens, kitchenId]);

  const chip = (val: string, cur: string, set: (v: string) => void) => (
    <button key={val} onClick={() => set(val)}
      className="px-3.5 py-2 rounded-full text-[12px] font-medium"
      style={cur === val
        ? { background: D, color: A, border: `0.5px solid ${D}` }
        : { background: '#fff', color: '#5A6B5A', border: `0.5px solid ${BR}` }}>
      {val}
    </button>
  );

  async function generate() {
    if (!kitchenId) return;
    setBusy(true);
    try {
      const r = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchenId, diet, goal }),
      });
      if (r.status === 401) { toast.error('Sign in to build a plan'); router.push('/auth/login?next=/planner'); return; }
      const d = await r.json();
      if (d.days) setPlan(d);
      else toast.error(d.error || 'Could not build a plan — try again');
    } catch {
      toast.error('Could not reach the planner — try again');
    } finally {
      setBusy(false);
    }
  }

  const weekCal = plan ? plan.days.reduce((s, d) => s + (d.calories ?? 0), 0) : 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold mb-2" style={{ color: '#5A6B5A' }}>HOW MUCH DO YOU WANT TO EAT?</p>
        <div className="grid grid-cols-3 gap-2">
          {TARGETS.map((t) => (
            <button key={t.cal} onClick={() => setCalorieTarget(t.cal)}
              className="rounded-2xl p-3 text-center"
              style={calorieTarget === t.cal
                ? { background: D, border: `0.5px solid ${D}` }
                : { background: '#fff', border: `0.5px solid ${BR}` }}>
              <p className="text-[12.5px] font-bold" style={{ color: calorieTarget === t.cal ? A : D }}>{t.label}</p>
              <p className="text-[10px]" style={{ color: calorieTarget === t.cal ? '#C9DDD1' : '#8A9A8A' }}>{t.sub}</p>
            </button>
          ))}
        </div>
        <p className="text-[10.5px] mt-1.5" style={{ color: '#A8B4A8' }}>
          A yardstick for the meal cards, nothing more — change it any time.
        </p>
      </div>

      {kitchens.length > 1 && (
        <div>
          <p className="text-[11px] font-bold mb-2" style={{ color: '#5A6B5A' }}>KITCHEN</p>
          <div className="flex gap-2 flex-wrap">
            {kitchens.map((k) => chip(k.name, kitchens.find(x => x.id === kitchenId)?.name ?? '', (name) => {
              const match = kitchens.find(x => x.name === name);
              if (match) { setKitchenId(match.id); setPlan(null); }
            }))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold mb-2" style={{ color: '#5A6B5A' }}>DIET</p>
        <div className="flex gap-2 flex-wrap">{DIETS.map((v) => chip(v, diet, setDiet))}</div>
      </div>
      <div>
        <p className="text-[11px] font-bold mb-2" style={{ color: '#5A6B5A' }}>GOAL</p>
        <div className="flex gap-2 flex-wrap">{GOALS.map((v) => chip(v, goal, setGoal))}</div>
      </div>

      <button onClick={generate} disabled={busy || !kitchenId}
        className="w-full py-4 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: D, color: A }}>
        {busy ? <><RefreshCw size={14} className="animate-spin" /> Building your week…</>
          : plan ? <><RefreshCw size={14} /> Shuffle — different week</>
          : <><Sparkles size={14} /> Build my week</>}
      </button>

      {plan && (
        <>
          <div className="space-y-2.5">
            {plan.days.map((d) => (
              <div key={d.day} className="rounded-2xl p-3.5 bg-white flex gap-3" style={{ border: `0.5px solid ${BR}` }}>
                <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: D }}>
                  <span className="text-[9px] font-bold" style={{ color: A }}>{d.day}</span>
                  <span className="text-[14px]">{d.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="text-[13px] font-semibold" style={{ color: D }}>{d.name}</p>
                    <p className="text-[13px] font-bold flex-shrink-0" style={{ color: D }}>${d.price}</p>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#8A9A8A' }}>{d.description}</p>
                  <p className="text-[10.5px] mt-1 flex items-center gap-1" style={{ color: '#C8941A' }}>
                    <Flame size={10} /> {calLine(d.calories, calorieTarget)} · {d.protein} protein
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4" style={{ background: LT, border: `0.5px solid ${A}` }}>
            <div className="flex justify-between text-[12px]" style={{ color: '#8A9A8A' }}>
              <span>Week of meals</span><span>{weekCal.toLocaleString()} cal · avg {Math.round(weekCal / plan.days.length)}/meal</span>
            </div>
            <div className="flex justify-between text-[12px] mt-1" style={{ color: '#8A9A8A' }}>
              <span>Items total</span><span>${plan.subtotal}</span>
            </div>
            <div className="flex justify-between text-[12px] mt-1" style={{ color: '#C8941A' }}>
              <span>Plan discount ({plan.discountPct}%)</span><span>−${(plan.subtotal - plan.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold mt-2 pt-2" style={{ color: D, borderTop: `0.5px solid ${A}` }}>
              <span>Weekly total</span><span>${plan.total}</span>
            </div>
          </div>

          <button onClick={() => router.push(`/checkout?kitchenId=${kitchenId}`)}
            className="w-full py-4 rounded-2xl text-[15px] font-bold"
            style={{ background: A, color: D }}>
            Continue — ${plan.total}/week
          </button>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function PlannerPage() {
  const { kitchens, loading: kLoading, failed } = useKitchens('Surrey');
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);

  function loadSubs() {
    fetch('/api/subscriptions')
      .then(async (r) => {
        if (r.status === 401) { setSignedOut(true); return { subscriptions: [] }; }
        return r.json();
      })
      .then((d) => setSubs(d.subscriptions ?? []))
      .catch(() => setSubs([]));
  }
  useEffect(loadSubs, []);

  const active = (subs ?? []).find((s) => s.status === 'ACTIVE' || s.status === 'PAUSED') ?? null;
  const ready = subs !== null && !kLoading;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F5F0' }}>
      <div style={{ background: `linear-gradient(160deg, ${D}, #0A5533)` }} className="px-5 pt-12 pb-6">
        <h1 className="text-[22px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          {active ? 'Your week' : 'Plan your week'}
        </h1>
        <p className="text-[12px] mt-1" style={{ color: '#C9DDD1' }}>
          {active ? 'Five days, planned and paid once.' : 'Pick a kitchen, set your appetite, and we build the week.'}
        </p>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto">
        {!ready && (
          <div className="space-y-3">
            {[0, 1].map((i) => <div key={i} className="rounded-2xl bg-white animate-pulse" style={{ height: 90, border: `0.5px solid ${BR}` }} />)}
          </div>
        )}

        {ready && failed && (
          <div className="rounded-2xl p-4 flex items-start gap-2.5" style={{ background: '#FFF4F4', border: '0.5px solid #F3D4D4' }}>
            <AlertCircle size={15} color="#B4433F" className="mt-0.5" />
            <p className="text-[12.5px]" style={{ color: '#B4433F' }}>We could not load the kitchens — try again in a moment.</p>
          </div>
        )}

        {ready && !failed && signedOut && !active && (
          <div className="rounded-2xl p-4 mb-5" style={{ background: LT, border: `0.5px solid ${A}` }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: '#8A6A18' }}>
              You can build a week without an account — <Link href="/auth/login?next=/planner" className="font-bold underline">sign in</Link> when you want to keep it.
            </p>
          </div>
        )}

        {ready && !failed && (
          active
            ? <MyPlan sub={active} onChanged={loadSubs} />
            : kitchens.length > 0
              ? <Builder kitchens={kitchens} />
              : (
                <div className="rounded-2xl p-6 text-center bg-white" style={{ border: `0.5px solid ${BR}` }}>
                  <p className="text-[26px] mb-2">🍲</p>
                  <p className="text-[13.5px] font-semibold mb-1" style={{ color: D }}>No kitchens to plan from yet</p>
                  <p className="text-[12px]" style={{ color: '#8A9A8A' }}>We are onboarding Surrey kitchens now — check back soon.</p>
                </div>
              )
        )}
      </div>

      <NavBar />
    </div>
  );
}

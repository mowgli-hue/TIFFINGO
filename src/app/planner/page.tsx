'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { PlannerMessage, WeeklyMeal } from '@/lib/types';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DEFAULT_MEALS: WeeklyMeal[] = [
  { day: 'Mon', name: 'Chicken tikka + rice',    kitchen: 'Ghar Ka Khana', protein: '38g', calories: 620 },
  { day: 'Tue', name: 'Lamb keema + roti',        kitchen: 'Ghar Ka Khana', protein: '41g', calories: 660 },
  { day: 'Wed', name: 'Paneer bhurji + quinoa',   kitchen: 'Ghar Ka Khana', protein: '32g', calories: 580 },
  { day: 'Thu', name: 'Grilled chicken bowl',     kitchen: 'Nourish Box',   protein: '44g', calories: 490 },
  { day: 'Fri', name: 'Dal tadka + brown rice',   kitchen: 'Ghar Ka Khana', protein: '28g', calories: 520 },
];

const SWAP_OPTIONS: Record<string, string[]> = {
  Mon: ['Chicken tikka + rice', 'Mutton biryani', 'Seekh kebab + naan'],
  Tue: ['Lamb keema + roti', 'Chicken karahi', 'Nihari + rice'],
  Wed: ['Paneer bhurji + quinoa', 'Chole + naan', 'Palak paneer + roti'],
  Thu: ['Grilled chicken bowl', 'Chicken shawarma bowl', 'Tandoori platter'],
  Fri: ['Dal tadka + brown rice', 'Masoor dal + roti', 'Rajma + quinoa'],
};

const INITIAL_MESSAGE: PlannerMessage = {
  role: 'assistant',
  content: "Hi! I've looked at your goals — High protein + Halal only. I've built your first week. Want to tweak anything?",
};

const AI_REPLIES = [
  "Done! I've updated your plan. Anything else you'd like to adjust?",
  "Got it — swapped that meal for a higher protein option. Your weekly average is now 37g protein/meal.",
  "Sure! I've added that to your preferences for all future weeks too.",
  "I've noted that. Your Wednesday meals will always be vegetarian from now on.",
  "Great choice. I've also added more lentil-based meals on Fridays for the extra fibre.",
];

export default function PlannerPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<PlannerMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [meals, setMeals] = useState<WeeklyMeal[]>(DEFAULT_MEALS);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setTyping(true);

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, meals }),
      });
      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)] }]);
      if (data.updatedMeals) setMeals(data.updatedMeals);
    } catch {
      setTyping(false);
      const fallback = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    }
  }

  function swapMeal(day: string) {
    setMeals(prev => prev.map(m => {
      if (m.day !== day) return m;
      const opts = SWAP_OPTIONS[day] ?? [];
      const idx = (opts.indexOf(m.name) + 1) % opts.length;
      return { ...m, name: opts[idx] };
    }));
    toast.success('Meal swapped');
  }

  function regenerate() {
    const shuffled = DAYS.map(day => ({
      day,
      name: SWAP_OPTIONS[day][Math.floor(Math.random() * SWAP_OPTIONS[day].length)],
      kitchen: Math.random() > 0.5 ? 'Ghar Ka Khana' : 'Nourish Box',
      protein: `${28 + Math.floor(Math.random() * 18)}g`,
      calories: 480 + Math.floor(Math.random() * 200),
    }));
    setMeals(shuffled);
    toast.success('Week regenerated');
  }

  const avgProtein = Math.round(meals.reduce((s, m) => s + parseInt(m.protein), 0) / meals.length);
  const avgCal = Math.round(meals.reduce((s, m) => s + m.calories, 0) / meals.length);

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24 flex flex-col">
      {/* Header */}
      <div className="bg-[#F5F5F0] px-5 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-[#D8DDD0] rounded-full flex items-center justify-center">
            <ArrowLeft size={14} className="text-[#1A3A2A]" />
          </button>
          <h1 className="font-serif text-[19px] text-[#1A3A2A]">AI meal planner</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FFFBEB] rounded-xl px-2.5 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A2A] animate-pulse" />
          <span className="text-[10px] font-medium text-[#0F6E56]">Active</span>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 px-5 py-3 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'items-end gap-2')}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#FFFBEB] flex items-center justify-center flex-shrink-0 mb-0.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#1D9E75" strokeWidth="1.1"/><path d="M4 6h4M6 4v4" stroke="#1D9E75" strokeWidth="1.1" strokeLinecap="round"/></svg>
              </div>
            )}
            <div className={clsx(
              'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#1A3A2A] text-white rounded-br-sm'
                : 'bg-white border border-[#D8DDD0] text-[#1A3A2A] rounded-bl-sm'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#1D9E75" strokeWidth="1.1"/><path d="M4 6h4M6 4v4" stroke="#1D9E75" strokeWidth="1.1" strokeLinecap="round"/></svg>
            </div>
            <div className="bg-white border border-[#D8DDD0] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
              {[0, 0.18, 0.36].map(d => (
                <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#B4B2A9] animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#D8DDD0]" />

      {/* Weekly plan */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-[12px] font-medium text-[#1A3A2A]">This week&apos;s plan</p>
            <p className="text-[10px] text-[#8A9A8A]">Tailored · High protein · Halal</p>
          </div>
          <button onClick={regenerate} className="flex items-center gap-1 bg-[#FFFBEB] text-[#0F6E56] px-2.5 py-1 rounded-lg text-[10px] font-medium">
            <RefreshCw size={10} />
            Regenerate
          </button>
        </div>

        {meals.map((meal, i) => (
          <div key={meal.day} className={clsx('flex items-center gap-2.5 py-2', i < meals.length - 1 && 'border-b border-[#F1EFE8]')}>
            <span className="text-[11px] font-medium text-[#8A9A8A] w-8 flex-shrink-0">{meal.day}</span>
            <div className="flex-1 bg-white border border-[#D8DDD0] rounded-xl px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-[#1A3A2A]">{meal.name}</p>
                <p className="text-[10px] text-[#8A9A8A]">{meal.kitchen}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-[#1A3A2A]">{meal.protein} protein</span>
                <button onClick={() => swapMeal(meal.day)} className="w-6 h-6 rounded-full bg-[#F1EFE8] flex items-center justify-center">
                  <RefreshCw size={10} className="text-[#8A9A8A]" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Nutrition strip */}
        <div className="mt-3 bg-white border border-[#D8DDD0] rounded-xl overflow-hidden flex">
          {[
            { val: avgCal.toLocaleString(), label: 'avg cal/day',    fill: '#1D9E75', pct: 78 },
            { val: `${avgProtein}g`,        label: 'protein/meal',   fill: '#534AB7', pct: 85 },
            { val: '100%',                  label: 'halal verified', fill: '#BA7517', pct: 100 },
          ].map((n, i) => (
            <div key={n.label} className={clsx('flex-1 px-2 py-2.5 text-center', i < 2 && 'border-r border-[#D8DDD0]')}>
              <p className="text-[13px] font-medium text-[#1A3A2A]">{n.val}</p>
              <p className="text-[9px] text-[#8A9A8A] mb-1.5">{n.label}</p>
              <div className="h-1 bg-[#F1EFE8] rounded-full mx-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${n.pct}%`, background: n.fill }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-5 pb-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Swap a meal, add a goal..."
          className="flex-1 border border-[#D8DDD0] rounded-xl px-3.5 py-2.5 text-[12px] text-[#1A3A2A] placeholder-[#B4B2A9] bg-white"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#1A3A2A] flex items-center justify-center disabled:opacity-40"
        >
          <Send size={14} className="text-white" />
        </button>
      </div>

      {/* CTA */}
      <div className="px-5 pb-4">
        <button className="w-full py-3 bg-[#1A3A2A] text-white rounded-2xl text-[13px] font-medium">
          Confirm this week&apos;s plan
        </button>
      </div>

      <NavBar />
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Search, Clock, ChevronDown, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/store/cart';
import clsx from 'clsx';

type WeeklyMeal = { id: string; day: string; emoji: string; name: string; description: string; protein: string; calories: number; tags: string[]; };
type Kitchen = { id: string; name: string; tagline: string; cuisine: string; type: string; city: string; rating: number; reviewCount: number; isOpen: boolean; isHalal: boolean; isVeg: boolean; pricePerMeal: number; weeklyPrice: number; weeklySavingsPct: number; weeklyMeals: WeeklyMeal[]; };

function getTodayMeal(meals: WeeklyMeal[]) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = days[new Date().getDay()];
  return meals.find(m => m.day === today) ?? meals[0] ?? null;
}

function hoursUntilCutoff() {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(20, 0, 0, 0);
  if (now >= cutoff) return 0;
  return Math.floor((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60));
}

export default function HomePage() {
  const { user } = useAuth();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hoursLeft = hoursUntilCutoff();
  const pastCutoff = hoursLeft === 0;

  useEffect(() => {
    fetch('/api/kitchens?city=Surrey')
      .then(r => r.json())
      .then(d => { setKitchens(d.kitchens ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = kitchens.filter(k => {
    if (category === 'Halal' && !k.isHalal) return false;
    if (category === 'Vegetarian' && !k.isVeg) return false;
    if (category === 'Tiffin' && k.type !== 'tiffin') return false;
    if (category === 'Restaurant' && k.type !== 'restaurant') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return k.name.toLowerCase().includes(q) || k.cuisine.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F5F5F0' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #2D6A4A 100%)' }} className="px-5 pt-14 pb-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#F0B429' }} />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Surrey, BC</span>
            <ChevronDown size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.2)' }}>
              <span className="text-[12px] font-semibold text-white">{firstName[0]?.toUpperCase()}</span>
            </div>
          </Link>
        </div>

        <h1 className="text-[32px] font-bold text-white leading-tight mb-1 relative z-10" style={{ fontFamily: 'Fraunces, serif' }}>
          {greeting},<br />
          <em style={{ fontStyle: 'italic', color: '#F0B429' }}>{firstName}.</em>
        </h1>
        <p className="text-[13px] mb-5 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {pastCutoff ? "Plan tomorrow's meals 🌙" : "What's cooking today? 🍲"}
        </p>

        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 relative z-10" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
          <Search size={15} style={{ color: '#A8B4A8', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search kitchens or cuisine..."
            className="flex-1 text-[13px] bg-transparent border-none outline-none" style={{ color: '#1A3A2A' }} />
          {search && <button onClick={() => setSearch('')} style={{ color: '#A8B4A8', fontSize: 11 }}>✕</button>}
        </div>

        {!pastCutoff && (
          <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 relative z-10" style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)' }}>
            <Clock size={12} style={{ color: '#F0B429', flexShrink: 0 }} />
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Order by <span style={{ color: '#F0B429', fontWeight: 600 }}>8pm tonight</span> for tomorrow's delivery
            </p>
            {hoursLeft > 0 && <span className="ml-auto text-[11px] font-semibold flex-shrink-0" style={{ color: '#F0B429' }}>{hoursLeft}h left</span>}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all"
              style={category === cat ? { background: '#1A3A2A', color: '#F0B429', borderColor: '#1A3A2A' } : { background: '#fff', color: '#5A6B5A', borderColor: '#D8DDD0' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Kitchen cards */}
      <div className="px-5 pt-2 space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="rounded-3xl h-48 animate-pulse" style={{ background: '#E8EDE8' }} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3">🍽️</p>
            <p className="text-[14px] font-semibold" style={{ color: '#1A3A2A' }}>No kitchens found</p>
            <p className="text-[12px] mt-1" style={{ color: '#5A6B5A' }}>Try a different search or category</p>
          </div>
        ) : filtered.map(kitchen => {
          const meal = getTodayMeal(kitchen.weeklyMeals);
          if (!meal) return null;
          return (
            <Link key={kitchen.id} href={`/kitchen/${kitchen.id}`}>
              <div className="bg-white rounded-3xl overflow-hidden border active:scale-[0.99] transition-transform" style={{ borderColor: '#D8DDD0', boxShadow: '0 2px 12px rgba(26,58,42,0.06)' }}>
                {/* Top stripe */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, #1A3A2A, #2D6A4A)` }} />

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Emoji */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: '#FFFBEB' }}>
                      {meal.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[11px] font-medium" style={{ color: '#5A6B5A' }}>{kitchen.name}</span>
                        {kitchen.isHalal && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#FFFBEB', color: '#C8941A' }}>Halal</span>}
                        {kitchen.isVeg && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#E8F0E8', color: '#2D6A4A' }}>Veg</span>}
                        {!kitchen.isOpen && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#F0EEE8', color: '#8A9A8A' }}>Coming soon</span>}
                      </div>
                      <h3 className="text-[16px] font-semibold leading-snug mb-1" style={{ color: '#1A3A2A', fontFamily: 'Fraunces, serif' }}>{meal.name}</h3>
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#8A9A8A' }}>{meal.description}</p>
                    </div>
                  </div>

                  {kitchen.isOpen && (
                    <>
                      <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '0.5px solid #EEF0EA' }}>
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-medium" style={{ color: '#1A3A2A' }}>{kitchen.rating || 'New'}</span>
                          {kitchen.reviewCount > 0 && <span className="text-[10px]" style={{ color: '#A8B4A8' }}>({kitchen.reviewCount})</span>}
                        </div>
                        <div className="w-px h-3" style={{ background: '#D8DDD0' }} />
                        <span className="text-[11px]" style={{ color: '#8A9A8A' }}>{meal.protein} protein</span>
                        <div className="w-px h-3" style={{ background: '#D8DDD0' }} />
                        <span className="text-[11px]" style={{ color: '#8A9A8A' }}>{meal.calories} cal</span>
                        <div className="flex-1" />
                        <span className="text-[15px] font-bold" style={{ color: '#1A3A2A' }}>${kitchen.pricePerMeal}</span>
                        <span className="text-[12px] font-semibold text-white px-3 py-1.5 rounded-full" style={{ background: '#1A3A2A' }}>Order →</span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#FFFBEB' }}>
                        <span className="text-[13px]">📦</span>
                        <span className="text-[11px]" style={{ color: '#8A9A8A' }}>Weekly package</span>
                        <span className="text-[11px] font-semibold" style={{ color: '#1A3A2A' }}>${kitchen.weeklyPrice}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#F0B429', color: '#1A3A2A' }}>Save {kitchen.weeklySavingsPct}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* AI Planner */}
        <Link href="/planner">
          <div className="rounded-3xl p-4 flex items-center gap-3 bg-white border" style={{ borderColor: '#D8DDD0', boxShadow: '0 2px 12px rgba(26,58,42,0.06)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1A3A2A,#2D6A4A)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-bold tracking-wider mb-0.5" style={{ color: '#F0B429' }}>AI MEAL PLANNER</p>
              <p className="text-[14px] font-semibold" style={{ color: '#1A3A2A', fontFamily: 'Fraunces, serif' }}>Build your perfect week</p>
              <p className="text-[11px]" style={{ color: '#8A9A8A' }}>Set goals · AI picks your meals</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FFFBEB' }}>
              <span style={{ color: '#F0B429', fontSize: 14, fontWeight: 700 }}>→</span>
            </div>
          </div>
        </Link>
      </div>

      <NavBar />
    </div>
  );
}

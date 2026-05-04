'use client';
import { useState, useMemo } from 'react';
import { Search, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { MOCK_KITCHENS, WEEKLY_MEALS, getTodayMeal, hoursUntilCutoff, isPastCutoff, CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/store/cart';
import clsx from 'clsx';

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hoursLeft = hoursUntilCutoff();
  const pastCutoff = isPastCutoff();

  const filtered = useMemo(() => {
    let list = MOCK_KITCHENS;
    if (activeCategory === 'Halal') list = list.filter(k => k.isHalal);
    else if (activeCategory === 'Vegetarian') list = list.filter(k => k.isVeg);
    else if (activeCategory === 'Tiffin') list = list.filter(k => k.type === 'tiffin');
    else if (activeCategory === 'Restaurant') list = list.filter(k => k.type === 'restaurant');
    else if (activeCategory === 'High protein') list = list.filter(k =>
      WEEKLY_MEALS[k.id]?.some(m => m.tags.includes('High protein'))
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(k => k.name.toLowerCase().includes(q) || k.cuisine.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FDF8F3' }}>

      {/* ── Hero header ── */}
      <div style={{ background: 'linear-gradient(135deg, #C8522A 0%, #A03E1A 100%)' }} className="px-5 pt-14 pb-6 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '16px 16px' }} />

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          <span className="text-[11px] text-orange-100">Vancouver, BC</span>
          <ChevronDown size={11} className="text-orange-200" />
        </div>

        {/* Greeting */}
        <h1 className="font-serif text-[28px] text-white leading-tight mb-1 relative z-10">
          {greeting},<br />
          <em className="text-yellow-300">{firstName}.</em>
        </h1>
        <p className="text-[13px] text-orange-100 mb-4 relative z-10">What's cooking today? 🍲</p>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 relative z-10 shadow-lg">
          <Search size={15} className="text-[#B4A494] flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search kitchens..."
            className="flex-1 text-[13px] bg-transparent border-none outline-none text-[#2C1810] placeholder-[#B4A494]"
          />
        </div>

        {/* Cutoff banner */}
        {!pastCutoff && (
          <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 relative z-10">
            <Clock size={12} className="text-yellow-300 flex-shrink-0" />
            <p className="text-[11px] text-orange-100">
              Order by <span className="text-yellow-300 font-medium">8pm tonight</span> for tomorrow's delivery
              {hoursLeft > 0 && <span className="text-orange-200"> · {hoursLeft}h left</span>}
            </p>
          </div>
        )}
      </div>

      {/* ── Categories ── */}
      <div className="px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                activeCategory === cat
                  ? 'text-white border-[#C8522A]'
                  : 'bg-white text-[#7A6A5A] border-[#E8DDD0]'
              )}
              style={activeCategory === cat ? { background: '#C8522A' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's meals ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-[17px] text-[#2C1810]">
            {pastCutoff ? "Tomorrow's meals 🌙" : "Today's meals 🍲"}
          </h2>
          <Link href="/explore" className="text-[11px] font-medium" style={{ color: '#C8522A' }}>See all</Link>
        </div>

        <div className="space-y-3">
          {filtered.map(kitchen => {
            const todayMeal = getTodayMeal(kitchen.id);
            if (!todayMeal) return null;
            return (
              <Link key={kitchen.id} href={`/kitchen/${kitchen.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-sm hover:shadow-md transition-shadow">
                  {/* Meal colour strip */}
                  <div className="h-2" style={{ background: kitchen.isHalal ? '#C8522A' : kitchen.isVeg ? '#2D7A4F' : '#BA7517' }} />

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji */}
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: '#FFF0E6' }}>
                        {todayMeal.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Kitchen name + badges */}
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[11px] font-medium text-[#7A6A5A]">{kitchen.name}</span>
                          {kitchen.isHalal && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#FFF0E6', color: '#C8522A' }}>Halal</span>
                          )}
                          {kitchen.isVeg && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#E8F5EE', color: '#2D7A4F' }}>Veg</span>
                          )}
                        </div>

                        {/* Meal name */}
                        <h3 className="text-[15px] font-medium text-[#2C1810] mb-1 leading-snug">{todayMeal.name}</h3>

                        {/* Description */}
                        <p className="text-[11px] text-[#9A8A7A] leading-relaxed mb-2 line-clamp-2">{todayMeal.description}</p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#2C1810]">${kitchen.pricePerMeal}</span>
                            <span className="text-[10px] text-[#9A8A7A]">·</span>
                            <span className="text-[10px] text-[#9A8A7A]">{todayMeal.protein} protein</span>
                            <span className="text-[10px] text-[#9A8A7A]">·</span>
                            <span className="text-[10px] text-[#9A8A7A]">{todayMeal.calories} cal</span>
                          </div>
                          <span className="text-[11px] font-medium" style={{ color: '#C8522A' }}>Order →</span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly package teaser */}
                    <div className="mt-3 pt-3 border-t border-[#F5EDE4] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#9A8A7A]">📦 Weekly package</span>
                        <span className="text-[10px] font-medium text-[#2C1810]">${kitchen.weeklyPrice}</span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#FFF0E6', color: '#C8522A' }}>Save {kitchen.weeklySavingsPct}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-[#9A8A7A]">★ {kitchen.rating}</span>
                        <span className="text-[9px] text-[#B4A494]">({kitchen.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* AI planner strip */}
        <Link href="/planner">
          <div className="mt-4 rounded-2xl p-4 flex items-center gap-3 border border-[#E8DDD0] bg-white">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: '#FFF0E6' }}>✨</div>
            <div className="flex-1">
              <p className="text-[9px] font-medium tracking-wider mb-0.5" style={{ color: '#C8522A' }}>AI MEAL PLANNER</p>
              <p className="text-[13px] font-medium text-[#2C1810]">Build your perfect week</p>
              <p className="text-[11px] text-[#9A8A7A]">Tell us your goals — AI picks your meals</p>
            </div>
            <span className="text-[12px] font-medium" style={{ color: '#C8522A' }}>→</span>
          </div>
        </Link>
      </div>

      <NavBar />
    </div>
  );
}

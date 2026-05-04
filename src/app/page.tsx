'use client';
import { useState, useMemo } from 'react';
import { Search, Clock, ChevronDown, Sparkles, Star } from 'lucide-react';
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
      <div style={{ background: 'linear-gradient(160deg, #BF4E2A 0%, #8C3118 100%)' }} className="px-5 pt-14 pb-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            <span className="text-[11px] text-orange-100 font-medium">Vancouver, BC</span>
            <ChevronDown size={11} className="text-orange-300" />
          </div>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-[13px] font-medium text-white">{firstName[0]?.toUpperCase()}</span>
            </div>
          </Link>
        </div>
        <h1 className="font-serif text-[30px] text-white leading-tight mb-1.5 relative z-10">
          {greeting},<br />
          <em className="text-yellow-300">{firstName}.</em>
        </h1>
        <p className="text-[13px] text-orange-200 mb-5 relative z-10">
          {pastCutoff ? "Plan tomorrow's meals 🌙" : "What's cooking today? 🍲"}
        </p>
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 relative z-10 shadow-xl shadow-black/20">
          <Search size={15} className="text-[#B4A494] flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search kitchens or cuisine..."
            className="flex-1 text-[13px] bg-transparent border-none outline-none text-[#2C1810] placeholder-[#C4B8AE]"
          />
          {search && <button onClick={() => setSearch('')} className="text-[#B4A494] text-[11px]">x</button>}
        </div>
        {!pastCutoff && (
          <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 relative z-10 border border-white/10">
            <Clock size={12} className="text-yellow-300 flex-shrink-0" />
            <p className="text-[11px] text-orange-100">
              Order by <span className="text-yellow-300 font-medium">8pm tonight</span> for tomorrow
            </p>
            {hoursLeft > 0 && <span className="ml-auto text-[11px] font-medium text-yellow-300 flex-shrink-0">{hoursLeft}h left</span>}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx('flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150', activeCategory === cat ? 'text-white border-transparent' : 'bg-white text-[#7A6A5A] border-[#E8DDD0]')}
              style={activeCategory === cat ? { background: '#BF4E2A' } : {}}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[32px] mb-3">🍽️</p>
            <p className="text-[14px] font-medium text-[#2C1810] mb-1">No kitchens found</p>
            <p className="text-[12px] text-[#9A8A7A]">Try a different search or category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(kitchen => {
              const todayMeal = getTodayMeal(kitchen.id);
              if (!todayMeal) return null;
              return (
                <Link key={kitchen.id} href={`/kitchen/${kitchen.id}`}>
                  <div className="bg-white rounded-3xl overflow-hidden border border-[#EDE5DA] shadow-sm active:scale-[0.99] transition-transform">
                    <div className="h-1.5" style={{ background: kitchen.isHalal ? 'linear-gradient(90deg,#BF4E2A,#E07A54)' : kitchen.isVeg ? 'linear-gradient(90deg,#2D7A4F,#52B788)' : 'linear-gradient(90deg,#BA7517,#E09B3D)' }} />
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FFF0E6,#FFE0CC)' }}>
                          {todayMeal.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[11px] font-medium text-[#9A8A7A]">{kitchen.name}</span>
                            {kitchen.isHalal && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#BF4E2A]">Halal</span>}
                            {kitchen.isVeg && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#2D7A4F]">Veg</span>}
                          </div>
                          <h3 className="text-[16px] font-medium text-[#2C1810] leading-snug mb-1">{todayMeal.name}</h3>
                          <p className="text-[11px] text-[#9A8A7A] leading-relaxed line-clamp-2">{todayMeal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F5EDE4]">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[11px] font-medium text-[#2C1810]">{kitchen.rating}</span>
                          <span className="text-[10px] text-[#B4A494]">({kitchen.reviewCount})</span>
                        </div>
                        <div className="w-px h-3 bg-[#E8DDD0]" />
                        <span className="text-[11px] text-[#9A8A7A]">{todayMeal.protein} protein</span>
                        <div className="w-px h-3 bg-[#E8DDD0]" />
                        <span className="text-[11px] text-[#9A8A7A]">{todayMeal.calories} cal</span>
                        <div className="flex-1" />
                        <span className="text-[14px] font-medium text-[#2C1810]">${kitchen.pricePerMeal}</span>
                        <span className="text-[12px] font-medium text-white px-3 py-1 rounded-full" style={{ background: '#BF4E2A' }}>Order</span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2 bg-[#FDF8F3] rounded-xl px-3 py-2">
                        <span className="text-[12px]">📦</span>
                        <span className="text-[11px] text-[#9A8A7A]">Weekly package</span>
                        <span className="text-[11px] font-medium text-[#2C1810]">${kitchen.weeklyPrice}</span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#BF4E2A]">Save {kitchen.weeklySavingsPct}%</span>
                        <div className="flex-1" />
                        <span className="text-[10px] text-[#9A8A7A]">5 meals/week</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <Link href="/planner">
          <div className="mt-4 rounded-3xl p-4 flex items-center gap-3 border border-[#E8DDD0] bg-white shadow-sm">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#BF4E2A,#8C3118)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-medium tracking-wider mb-0.5 text-[#BF4E2A]">AI MEAL PLANNER</p>
              <p className="text-[14px] font-medium text-[#2C1810]">Build your perfect week</p>
              <p className="text-[11px] text-[#9A8A7A]">Set goals · AI picks your meals</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center">
              <span className="text-[#BF4E2A] text-[14px]">→</span>
            </div>
          </div>
        </Link>
      </div>
      <NavBar />
    </div>
  );
}

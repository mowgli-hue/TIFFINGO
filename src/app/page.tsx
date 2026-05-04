'use client';
import { useState, useMemo } from 'react';
import { Search, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import KitchenCard from '@/components/KitchenCard';
import { MOCK_KITCHENS, CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/store/cart';
import clsx from 'clsx';

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const filtered = useMemo(() => {
    let list = MOCK_KITCHENS;
    if (activeCategory === 'Tiffin plans') list = list.filter(k => k.type === 'tiffin');
    else if (activeCategory === 'Healthy')   list = list.filter(k => ['Healthy','Vegan'].includes(k.cuisine));
    else if (activeCategory === 'Indian')    list = list.filter(k => ['Indian','Punjabi','Pakistani'].includes(k.cuisine));
    else if (activeCategory === 'Halal')     list = list.filter(k => k.isHalal);
    else if (activeCategory === 'Vegetarian') list = list.filter(k => k.isVeg);
    else if (activeCategory === 'Vegan')     list = list.filter(k => k.cuisine === 'Vegan');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(k =>
        k.name.toLowerCase().includes(q) ||
        k.cuisine.toLowerCase().includes(q) ||
        k.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const tiffinKitchens = MOCK_KITCHENS.filter(k => k.type === 'tiffin').slice(0, 4);
  const restaurants    = MOCK_KITCHENS.filter(k => k.type === 'restaurant');

  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-24">
      {/* ── Header ── */}
      <div className="bg-[#FDF8F3] px-5 pt-14 pb-4">
        {/* Location row */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#C8522A]" />
          <span className="text-[12px] text-[#5F5E5A]">Vancouver, BC</span>
          <ChevronDown size={12} className="text-[#9A8A7A]" />
        </div>

        {/* Greeting */}
        <h1 className="font-serif text-[26px] text-[#2C1810] leading-tight mb-1">
          {greeting},<br />
          <em className="text-[#C8522A]">{firstName}.</em>
        </h1>
        <p className="text-[13px] text-[#9A8A7A] mb-4">What's cooking today? 🍲</p>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white border border-[#E8DDD0] rounded-xl px-3.5 py-2.5">
          <Search size={15} className="text-[#B4B2A9] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search kitchens, dishes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 text-[13px] text-[#2C1810] placeholder-[#B4B2A9] bg-transparent border-none outline-none"
          />
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                activeCategory === cat
                  ? 'bg-[#2C1810] text-white border-[#2C1810]'
                  : 'bg-white text-[#5F5E5A] border-[#E8DDD0]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {searchQuery ? (
        /* ── Search results ── */
        <div className="px-5">
          <p className="text-[12px] text-[#9A8A7A] mb-3">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(k => <KitchenCard key={k.id} kitchen={k} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[14px] font-medium text-[#2C1810] mb-1">No results found</p>
              <p className="text-[12px] text-[#9A8A7A]">Try a different search term</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Tiffin kitchens ── */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-[#2C1810]">Top tiffin kitchens</h2>
              <Link href="/explore" className="text-[11px] text-[#C8522A] font-medium">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tiffinKitchens.map(k => <KitchenCard key={k.id} kitchen={k} />)}
            </div>
          </div>

          {/* ── Subscription promo ── */}
          <div className="px-5 mb-6">
            <Link href="/explore?filter=tiffin">
              <div className="bg-[#2C1810] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-[#FFD166] tracking-wider mb-1">MEAL PLANS</p>
                  <p className="text-[14px] font-medium text-white leading-snug">Subscribe &amp; save<br />up to 20%</p>
                  <p className="text-[11px] text-[#9A8A7A] mt-0.5">Weekly · Monthly plans</p>
                </div>
                <button className="bg-[#C8522A] text-white px-4 py-2 rounded-xl text-[12px] font-medium flex-shrink-0">
                  Explore
                </button>
              </div>
            </Link>
          </div>

          {/* ── AI Planner promo ── */}
          <div className="px-5 mb-6">
            <Link href="/planner">
              <div className="bg-white border border-[#C8522A] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8522A] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-medium text-[#0F6E56] bg-[#FFF0E6] px-2 py-0.5 rounded-full tracking-wide">AI MEAL PLANNER</span>
                  </div>
                  <p className="text-[13px] font-medium text-[#2C1810]">Personalise your weekly meals</p>
                  <p className="text-[11px] text-[#9A8A7A]">Set goals · AI builds your plan</p>
                </div>
                <span className="text-[#C8522A] text-[12px] font-medium">Try →</span>
              </div>
            </Link>
          </div>

          {/* ── Nearby restaurants ── */}
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-[#2C1810]">Nearby restaurants</h2>
              <Link href="/explore?filter=restaurant" className="text-[11px] text-[#C8522A] font-medium">See all</Link>
            </div>
            <div className="space-y-2.5">
              {restaurants.map(k => (
                <Link key={k.id} href={`/kitchen/${k.id}`}>
                  <div className="bg-white border border-[#E8DDD0] rounded-2xl p-3.5 flex items-center gap-3 hover:border-[#C8522A] transition-colors">
                    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0', 'bg-[#FAEEDA]')}>
                      🍛
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#2C1810]">{k.name}</p>
                      <p className="text-[11px] text-[#9A8A7A]">{k.cuisine} · {k.deliveryTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-medium text-[#2C1810]">${k.pricePerMeal}/meal</p>
                      <p className="text-[10px] text-[#9A8A7A]">★ {k.rating}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <NavBar />
    </div>
  );
}

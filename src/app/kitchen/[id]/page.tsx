'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { isPastCutoff, hoursUntilCutoff } from '@/lib/mock-data';
import { useKitchen } from '@/lib/kitchens';
import { useCart } from '@/store/cart';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function KitchenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { kitchen, loading, failed } = useKitchen(id);
  const meals = kitchen?.weeklyMeals ?? [];
  const { setMealOrder } = useCart();
  const [liked, setLiked] = useState(false);
  // The kitchen arrives async, so hold only an explicit choice and fall back
  // to the first available option until the customer picks one.
  const [dayChoice, setDayChoice] = useState<string | null>(null);
  const [slotChoice, setSlotChoice] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const selectedDay = dayChoice ?? meals[0]?.day ?? 'Mon';
  const selectedSlot = slotChoice ?? kitchen?.deliverySlots?.[0] ?? '12:00pm';
  const setSelectedDay = setDayChoice;
  const setSelectedSlot = setSlotChoice;
  const pastCutoff = isPastCutoff();
  const hoursLeft = hoursUntilCutoff();
  const selectedMeal = meals.find(m => m.day === selectedDay) ?? meals[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}>
      <p className="text-[#8A9A8A] text-[13px]">Loading kitchen…</p>
    </div>
  );

  if (failed) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: '#F5F5F0' }}>
      <p className="text-[15px] font-medium text-[#1A3A2A]">We can&rsquo;t load this kitchen right now</p>
      <button onClick={() => location.reload()}
        className="px-4 py-2 rounded-full text-[12.5px] font-semibold bg-[#043F28] text-white">Try again</button>
    </div>
  );

  if (!kitchen) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: '#F5F5F0' }}>
      <p className="text-[15px] font-medium text-[#1A3A2A]">Kitchen not found</p>
      <p className="text-[12px] text-[#8A9A8A]">It may have stopped taking orders.</p>
      <Link href="/explore" className="px-4 py-2 rounded-full text-[12.5px] font-semibold bg-[#043F28] text-white">Browse kitchens</Link>
    </div>
  );

  function handleOrderSingle() {
    if (!selectedMeal) return;
    router.push(`/checkout?kitchenId=${kitchen!.id}&day=${selectedDay}&weekly=false`);
  }

  function handleOrderWeekly() {
    router.push(`/checkout?kitchenId=${kitchen!.id}&weekly=true`);
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: '#F5F5F0' }}>

      {/* ── Hero ── */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #1A3A2A, #2D6A4A)', minHeight: 200 }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '16px 16px' }} />

        {/* Back + like */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 relative z-10">
          <button onClick={() => router.back()} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={15} className="text-white" />
          </button>
          <button onClick={() => setLiked(!liked)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Heart size={15} className={liked ? 'fill-red-400 text-red-400' : 'text-white'} />
          </button>
        </div>

        {/* Kitchen info */}
      {/* AI Plan Builder entry */}
      <Link href={`/kitchen/${id}/plan`}>
        <div className="rounded-2xl p-4 flex items-center gap-3 mx-5 mt-4" style={{background:'#1A3A2A'}}>
          <span style={{fontSize:18}}>✨</span>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-white">Build your own week</p>
            <p className="text-[11px]" style={{color:'rgba(255,255,255,0.5)'}}>AI plans it from this menu — save 15%</p>
          </div>
          <span style={{color:'#F0B429'}}>→</span>
        </div>
      </Link>

        <div className="px-5 pb-6 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {kitchen.isHalal && <span className="text-[9px] font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">Halal</span>}
            {kitchen.isVeg && <span className="text-[9px] font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">Vegetarian</span>}
            <span className="text-[9px] font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">{kitchen.cuisine}</span>
          </div>
          <h1 className="font-serif text-[26px] text-white mb-0.5">{kitchen.name}</h1>
          <p className="text-[13px] text-orange-100 italic mb-3">"{kitchen.tagline}"</p>
          <div className="flex items-center gap-3 text-[11px] text-orange-200">
            <span className="flex items-center gap-1"><Star size={11} className="fill-yellow-300 text-yellow-300" />{kitchen.rating} ({kitchen.reviewCount})</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={11} />Cutoff {kitchen.cutoffTime}</span>
          </div>
        </div>
      </div>

      {/* ── Cutoff timer ── */}
      {!pastCutoff && (
        <div className="mx-5 -mt-3 bg-[#1A3A2A] rounded-2xl px-4 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-yellow-300" />
            <p className="text-[12px] text-white">Order by <span className="text-yellow-300 font-medium">8pm tonight</span> for tomorrow</p>
          </div>
          <span className="text-[11px] font-medium text-orange-300">{hoursLeft}h left</span>
        </div>
      )}

      {/* ── Weekly meal calendar ── */}
      <div className="px-5 mt-4">
        <h2 className="font-serif text-[17px] text-[#1A3A2A] mb-3">This week's meals</h2>

        <div className="space-y-2.5">
          {meals.map((meal, i) => {
            const isSelected = selectedDay === meal.day;
            const isExpanded = expandedDay === meal.day;
            return (
              <div
                key={meal.day}
                className={clsx('bg-white rounded-2xl border transition-all overflow-hidden', isSelected ? 'border-[#1A3A2A]' : 'border-[#D8DDD0]')}
                style={isSelected ? { boxShadow: '0 0 0 1px #1A3A2A20' } : {}}
              >
                <button
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                  onClick={() => { setSelectedDay(meal.day); setExpandedDay(isExpanded ? null : meal.day); }}
                >
                  {/* Day pill */}
                  <div className={clsx('w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0', isSelected ? 'text-white' : 'bg-[#EEF0EA]')} style={isSelected ? { background: '#1A3A2A' } : {}}>
                    <span className={clsx('text-[9px] font-medium', isSelected ? 'text-orange-200' : 'text-[#8A9A8A]')}>{meal.day}</span>
                    <span className={clsx('text-[8px]', isSelected ? 'text-orange-200' : 'text-[#A8B4A8]')}>{meal.date}</span>
                  </div>

                  {/* Emoji */}
                  <span className="text-2xl flex-shrink-0">{meal.emoji}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1A3A2A] mb-0.5">{meal.name}</p>
                    <p className="text-[10px] text-[#8A9A8A]">{meal.protein} protein · {meal.calories} cal</p>
                  </div>

                  {/* Price + expand */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[13px] font-medium text-[#1A3A2A]">${kitchen.pricePerMeal}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-[#8A9A8A]" /> : <ChevronDown size={14} className="text-[#8A9A8A]" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 border-t border-[#EEF0EA]">
                    <p className="text-[12px] text-[#5A6B5A] leading-relaxed mt-2.5 mb-3">{meal.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {meal.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#FFFBEB', color: '#1A3A2A' }}>{tag}</span>
                      ))}
                    </div>
                    {/* Delivery slot */}
                    <p className="text-[10px] font-medium text-[#8A9A8A] tracking-wider mb-1.5">DELIVERY SLOT</p>
                    <div className="flex gap-2">
                      {kitchen.deliverySlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={clsx('flex-1 py-2 rounded-xl text-[11px] font-medium border transition-all', selectedSlot === slot ? 'text-white border-[#1A3A2A]' : 'bg-[#EEF0EA] text-[#5A6B5A] border-transparent')}
                          style={selectedSlot === slot ? { background: '#1A3A2A' } : {}}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Weekly package card ── */}
      <div className="mx-5 mt-4 bg-[#1A3A2A] rounded-2xl p-4">
        <p className="text-[9px] font-medium text-yellow-300 tracking-wider mb-1.5">WEEKLY PACKAGE</p>
        <p className="text-[15px] font-medium text-white mb-1">All 5 meals · ${kitchen.weeklyPrice}</p>
        <p className="text-[11px] text-orange-300 mb-3">Save {kitchen.weeklySavingsPct}% vs individual orders · Free delivery</p>
        <div className="flex gap-1.5 mb-3">
          {meals.map(m => (
            <div key={m.day} className="flex-1 bg-white/10 rounded-xl py-2 text-center">
              <p className="text-[9px] text-orange-300">{m.day}</p>
              <p className="text-[14px]">{m.emoji}</p>
            </div>
          ))}
        </div>
        <button onClick={handleOrderWeekly} className="w-full py-3 bg-[#1A3A2A] text-white rounded-xl text-[13px] font-medium">
          Subscribe to this week →
        </button>
      </div>

      {/* ── About ── */}
      <div className="px-5 mt-4 pb-4">
        <p className="text-[12px] text-[#8A9A8A] leading-relaxed">{kitchen.description}</p>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-5 pb-3 bg-[#F5F5F0] border-t border-[#D8DDD0]">
        <div className="pt-3">
          {selectedMeal && (
            <button
              onClick={handleOrderSingle}
              className="w-full py-3.5 text-white rounded-2xl text-[14px] font-medium flex items-center justify-between px-5"
              style={{ background: '#1A3A2A' }}
            >
              <span>Order {selectedMeal.emoji} {selectedMeal.day}'s meal</span>
              <span className="text-orange-200 text-[12px]">${kitchen.pricePerMeal} · {selectedSlot}</span>
            </button>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Heart, Clock, MapPin, Plus, Check } from 'lucide-react';
import NavBar from '@/components/NavBar';
import PlanCard from '@/components/PlanCard';
import CartDrawer from '@/components/CartDrawer';
import { MOCK_KITCHENS, MOCK_MENU_ITEMS } from '@/lib/mock-data';
import { useCart } from '@/store/cart';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const TABS = ['Today\'s menu', 'Weekly plan', 'Reviews'] as const;

export default function KitchenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const kitchen = MOCK_KITCHENS.find(k => k.id === id);
  const menuItems = MOCK_MENU_ITEMS[id] ?? [];

  const { addItem, items, selectedPlan, setPlan } = useCart();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Today\'s menu');
  const [cartOpen, setCartOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!kitchen) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#888780]">Kitchen not found</p>
    </div>
  );

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  function handleAdd(item: typeof menuItems[0]) {
    addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, kitchen!.id, kitchen!.name);
    toast.success(`${item.name} added`);
    setCartOpen(true);
  }

  function handleSubscribe() {
    if (!selectedPlan) {
      toast.error('Select a plan first');
      return;
    }
    router.push(`/checkout?kitchenId=${kitchen.id}&plan=${selectedPlan}`);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-32">
      {/* ── Hero ── */}
      <div className={clsx('h-44 flex items-center justify-center text-5xl relative', kitchen.type === 'tiffin' ? 'bg-[#E1F5EE]' : 'bg-[#FAEEDA]')}>
        <span>🍛</span>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-8 h-8 bg-white rounded-full border border-[#E8E5DE] flex items-center justify-center"
        >
          <ArrowLeft size={14} className="text-[#2C2C2A]" />
        </button>

        {/* Like */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-12 right-4 w-8 h-8 bg-white rounded-full border border-[#E8E5DE] flex items-center justify-center"
        >
          <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-[#2C2C2A]'} />
        </button>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-4 flex gap-2">
          {kitchen.type === 'tiffin' && (
            <span className="bg-[#1D9E75] text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full">Meal plan</span>
          )}
          {kitchen.isOpen
            ? <span className="bg-white text-[#5F5E5A] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#E8E5DE]">Open now</span>
            : <span className="bg-white text-[#D85A30] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#E8E5DE]">Closed</span>
          }
        </div>

        {/* Cart badge */}
        {cartCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="absolute top-12 right-14 bg-[#1D9E75] text-white text-[11px] font-medium px-3 py-1 rounded-full"
          >
            {cartCount} in cart
          </button>
        )}
      </div>

      {/* ── Info ── */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="font-serif text-[22px] text-[#2C2C2A] mb-1">{kitchen.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] text-[#5F5E5A]">
          <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{kitchen.rating} ({kitchen.reviewCount})</span>
          <span className="text-[#D3D1C7]">·</span>
          <span>{kitchen.type === 'tiffin' ? 'Home kitchen' : 'Restaurant'}</span>
          <span className="text-[#D3D1C7]">·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{kitchen.deliveryTime}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {kitchen.isHalal && <span className="badge-green">Halal</span>}
          {kitchen.isVeg && <span className="badge-green">Vegetarian</span>}
          <span className="badge-green">{kitchen.cuisine}</span>
        </div>
      </div>

      <div className="border-t border-[#E8E5DE]" />

      {/* ── Subscription plans ── */}
      {kitchen.type === 'tiffin' && (
        <>
          <div className="px-5 py-4">
            <p className="text-[12px] font-medium text-[#888780] tracking-wider mb-3">SUBSCRIBE &amp; SAVE</p>
            <div className="flex gap-2.5">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(plan => (
                <PlanCard key={plan} plan={plan} selected={selectedPlan === plan} onSelect={setPlan} />
              ))}
            </div>
          </div>
          <div className="border-t border-[#E8E5DE]" />
        </>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-[#E8E5DE]">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-2.5 text-[12px] font-medium border-b-2 transition-all',
              activeTab === tab
                ? 'text-[#2C2C2A] border-[#2C2C2A]'
                : 'text-[#888780] border-transparent'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Menu ── */}
      {activeTab === "Today's menu" && (
        <div className="px-5 py-3 space-y-0">
          {menuItems.map((item, i) => (
            <div key={item.id} className={clsx('flex items-center gap-3 py-3.5', i < menuItems.length - 1 && 'border-b border-[#F1EFE8]')}>
              <div className={clsx('w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0', i % 3 === 0 ? 'bg-[#E1F5EE]' : i % 3 === 1 ? 'bg-[#FAEEDA]' : 'bg-[#F1EFE8]')}>
                {item.tags.includes('Vegetarian') ? '🥘' : item.tags.includes('High protein') ? '🍗' : '🍛'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#2C2C2A] mb-0.5">{item.name}</p>
                <p className="text-[11px] text-[#888780] mb-1.5 truncate">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#2C2C2A]">${item.price.toFixed(2)}</span>
                  {item.protein && (
                    <span className="text-[10px] text-[#1D9E75] bg-[#E1F5EE] px-1.5 py-0.5 rounded-full">{item.protein}g protein</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleAdd(item)}
                className="w-8 h-8 rounded-full bg-[#2C2C2A] flex items-center justify-center flex-shrink-0"
              >
                <Plus size={15} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Weekly plan' && (
        <div className="px-5 py-6 text-center">
          <p className="text-[14px] font-medium text-[#2C2C2A] mb-1">Weekly menu rotates</p>
          <p className="text-[12px] text-[#888780]">Subscribe to see your personalised weekly meal schedule</p>
          <button
            onClick={() => { setPlan('WEEKLY'); setActiveTab("Today's menu"); }}
            className="mt-4 bg-[#1D9E75] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium"
          >
            Choose a plan
          </button>
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="px-5 py-4 space-y-4">
          {[
            { name: 'Priya S.', rating: 5, text: 'Best tiffin I\'ve had in Vancouver. Tastes exactly like home cooking.', date: '2 days ago' },
            { name: 'Rahul M.', rating: 5, text: 'Subscribed weekly. Dal makhani is outstanding. Driver always on time.', date: '1 week ago' },
            { name: 'Simran K.', rating: 4, text: 'Really good food and great value. Love the subscription model.', date: '2 weeks ago' },
          ].map((r, i) => (
            <div key={i} className="border-b border-[#F1EFE8] pb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-medium text-[#2C2C2A]">{r.name}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-[#5F5E5A] mb-1">{r.text}</p>
              <p className="text-[10px] text-[#B4B2A9]">{r.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── CTA bar ── */}
      <div className="fixed bottom-16 left-0 right-0 px-5 pb-3 bg-white border-t border-[#E8E5DE] max-w-md mx-auto">
        <div className="pt-3">
          {kitchen.type === 'tiffin' ? (
            <button
              onClick={handleSubscribe}
              className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium flex items-center justify-between px-5"
            >
              <span>Subscribe — {selectedPlan?.toLowerCase() ?? 'choose a'} plan</span>
              <span className="text-[#9FE1CB] text-[12px]">
                {selectedPlan ? `$${selectedPlan === 'DAILY' ? 45 : selectedPlan === 'WEEKLY' ? 75 : 270}/wk` : 'Select plan'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => cartCount > 0 ? setCartOpen(true) : null}
              className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium"
            >
              {cartCount > 0 ? `View cart (${cartCount} items)` : 'Add items to order'}
            </button>
          )}
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <NavBar />
    </div>
  );
}

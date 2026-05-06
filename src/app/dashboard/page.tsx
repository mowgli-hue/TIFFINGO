'use client';
import { useState } from 'react';
import { ShoppingBag, Users, DollarSign, Star, Bell, ChevronRight, Clock, RefreshCw, ChefHat, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const ORDERS = [
  { id: '001', customer: 'Priya S.', meal: 'Masala Chai + Paneer Paratha', status: 'PREPARING', time: '12:00pm', amount: 12 },
  { id: '002', customer: 'Rahul M.', meal: 'Masala Chai + Paneer Paratha', status: 'ON_THE_WAY', time: '12:00pm', amount: 12 },
  { id: '003', customer: 'Simran K.', meal: 'Weekly Package', status: 'DELIVERED', time: '12:00pm', amount: 50 },
  { id: '004', customer: 'David L.', meal: 'Masala Chai + Paneer Paratha', status: 'CONFIRMED', time: '5:00pm', amount: 12 },
];

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  CONFIRMED:  { bg: '#E3F5EE', color: '#2D9B6F', label: 'Confirmed' },
  PREPARING:  { bg: '#FFF8ED', color: '#C4841A', label: 'Preparing' },
  ON_THE_WAY: { bg: '#EEF2FF', color: '#3B5BDB', label: 'On the way' },
  DELIVERED:  { bg: '#F0EDE4', color: '#5A6B5A', label: 'Delivered' },
};

const MEALS = [
  { day: 'Mon', emoji: '🫖', name: 'Masala Chai + Paneer Paratha', orders: 34, price: 12 },
  { day: 'Tue', emoji: '🌯', name: 'Kadak Chai + Loaded Wrap', orders: 28, price: 12 },
  { day: 'Wed', emoji: '🍟', name: 'Elaichi Chai + Mix Pakoda', orders: 22, price: 12 },
  { day: 'Thu', emoji: '🍔', name: 'Kesar Milk + Paneer Burger', orders: 19, price: 12 },
  { day: 'Fri', emoji: '🥗', name: 'Kashmiri Chai + Samosa Chaat', orders: 31, price: 12 },
];

export default function MerchantDashboard() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'meals' | 'earnings'>('overview');
  const [prepCount] = useState(34);

  return (
    <div className="min-h-screen" style={{ background: '#F5F2E8' }}>
      {/* Header */}
      <div style={{ background: '#1A2E1A' }} className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8A020' }}>
              <ChefHat size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium" style={{ color: '#9FBF9F' }}>MERCHANT PORTAL</p>
              <p className="text-[15px] font-semibold text-white">The Chai Bar — Surrey</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#2D5A2D' }}>
            <Bell size={15} style={{ color: '#9FBF9F' }} />
          </button>
        </div>
        <div className="flex gap-1.5">
          {(['overview','orders','meals','earnings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-[11px] font-medium capitalize transition-all"
              style={{ background: tab === t ? '#E8A020' : '#2D5A2D', color: tab === t ? '#1A2E1A' : '#9FBF9F' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto">

        {tab === 'overview' && (<>
          {/* AI prep alert */}
          <div className="rounded-2xl p-4 mb-4 flex gap-3 items-start" style={{ background: '#1A2E1A' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#E8A020' }}>
              <span className="text-[16px]">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-semibold tracking-wider mb-1" style={{ color: '#E8A020' }}>AI PREP ALERT</p>
              <p className="text-[13px] font-medium text-white">Prep <span style={{ color: '#E8A020' }}>{prepCount} portions</span> of Masala Chai + Paneer Paratha</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#9FBF9F' }}>Today · Noon delivery · {prepCount} confirmed orders</p>
            </div>
            <RefreshCw size={14} style={{ color: '#5A7A5A' }} className="mt-1 cursor-pointer" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: ShoppingBag, label: "Today's orders", val: prepCount.toString(), sub: '+4 since 9am', color: '#E8A020' },
              { icon: DollarSign, label: "Today's revenue", val: `$${(prepCount * 12 * 0.9).toFixed(0)}`, sub: 'After 10% commission', color: '#2D9B6F' },
              { icon: Users, label: 'Subscribers', val: '48', sub: '+3 this week', color: '#3B5BDB' },
              { icon: Star, label: 'Avg rating', val: '4.9 ★', sub: 'Last 30 orders', color: '#E8A020' },
            ].map(({ icon: Icon, label, val, sub, color }) => (
              <div key={label} className="rounded-2xl p-3.5" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#5A6B5A' }}>{label}</span>
                </div>
                <p className="text-[22px] font-bold" style={{ color: '#1A2E1A' }}>{val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#5A6B5A' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Saved vs Uber */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#FFF8ED', border: '0.5px solid #E8A020' }}>
            <p className="text-[11px] font-semibold mb-1" style={{ color: '#C4841A' }}>💸 Saved vs Uber Eats this month</p>
            <p className="text-[28px] font-bold" style={{ color: '#1A2E1A' }}>$1,840</p>
            <p className="text-[11px]" style={{ color: '#C4841A' }}>Uber charges 30% · TiffinGo charges 10% · You keep $1,840 more</p>
          </div>

          {/* Live orders */}
          <p className="text-[12px] font-semibold mb-2" style={{ color: '#1A2E1A' }}>Live orders</p>
          <div className="space-y-2">
            {ORDERS.slice(0, 3).map(order => {
              const s = STATUS[order.status];
              return (
                <div key={order.id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#FFF8ED' }}>🍵</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium" style={{ color: '#1A2E1A' }}>{order.customer}</p>
                    <p className="text-[11px]" style={{ color: '#5A6B5A' }}>{order.meal}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <p className="text-[11px] mt-1" style={{ color: '#5A6B5A' }}>${order.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {tab === 'orders' && (<>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold" style={{ color: '#1A2E1A' }}>All orders today</p>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#FFF8ED', color: '#C4841A' }}>{ORDERS.length} orders</span>
          </div>
          <div className="space-y-2.5">
            {ORDERS.map(order => {
              const s = STATUS[order.status];
              return (
                <div key={order.id} className="rounded-2xl p-4" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: '#1A2E1A' }}>{order.customer}</p>
                      <p className="text-[12px]" style={{ color: '#5A6B5A' }}>{order.meal}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full h-fit" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2" style={{ borderTop: '0.5px solid #EDE8D8' }}>
                    <div className="flex items-center gap-1" style={{ color: '#5A6B5A' }}>
                      <Clock size={11} />
                      <span className="text-[11px]">{order.time}</span>
                    </div>
                    <div className="flex-1" />
                    <span className="text-[14px] font-bold" style={{ color: '#1A2E1A' }}>${order.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {tab === 'meals' && (<>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold" style={{ color: '#1A2E1A' }}>This week's meals</p>
            <button className="text-[11px] font-medium px-3 py-1.5 rounded-xl text-white" style={{ background: '#1A2E1A' }}>Edit week</button>
          </div>
          <div className="space-y-2.5">
            {MEALS.map(meal => (
              <div key={meal.day} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#FFF8ED' }}>{meal.emoji}</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: '#1A2E1A' }}>{meal.name}</p>
                  <p className="text-[11px]" style={{ color: '#5A6B5A' }}>{meal.day} · {meal.orders} orders · ${meal.price}/meal</p>
                </div>
                <ChevronRight size={16} style={{ color: '#A0A89A' }} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl p-4" style={{ background: '#E3F5EE', border: '0.5px solid #2D9B6F' }}>
            <p className="text-[12px] font-semibold mb-1" style={{ color: '#2D9B6F' }}>🤖 AI suggestion</p>
            <p className="text-[12px]" style={{ color: '#2D9B6F' }}>Mix Pakoda combo had 40% more reorders than average. Feature it again next week.</p>
          </div>
        </>)}

        {tab === 'earnings' && (<>
          <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
            <p className="text-[11px] font-medium mb-1" style={{ color: '#5A6B5A' }}>THIS WEEK'S EARNINGS</p>
            <p className="text-[36px] font-bold" style={{ color: '#1A2E1A' }}>$1,458</p>
            <p className="text-[12px]" style={{ color: '#2D9B6F' }}>+$234 vs last week</p>
            <div className="flex gap-1.5 mt-4 items-end h-14">
              {[65,80,55,70,90,75,85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: i === 6 ? '#E8A020' : '#EDE8D8' }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px]" style={{ color: '#5A6B5A' }}>{d}</span>
              ))}
            </div>
          </div>
          {[
            { label: 'Gross revenue', val: '$1,620', note: 'Before commission' },
            { label: 'Commission (10%)', val: '-$162', note: 'Platform fee' },
            { label: 'Net earnings', val: '$1,458', note: 'Paid Sunday' },
            { label: 'Next payout', val: 'Sunday', note: 'Direct to bank' },
          ].map(row => (
            <div key={row.label} className="rounded-2xl p-3.5 mb-2 flex justify-between items-center" style={{ background: '#fff', border: '0.5px solid #DDD5C0' }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#1A2E1A' }}>{row.label}</p>
                <p className="text-[11px]" style={{ color: '#5A6B5A' }}>{row.note}</p>
              </div>
              <p className="text-[15px] font-bold" style={{ color: '#1A2E1A' }}>{row.val}</p>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );
}

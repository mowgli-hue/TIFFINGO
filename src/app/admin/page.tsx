'use client';
import { useState } from 'react';
import { TrendingUp, Store, Users, Truck, AlertCircle, CheckCircle, XCircle, Eye, DollarSign, MapPin } from 'lucide-react';

const KITCHENS = [
  { id: 'chaibar-surrey', name: 'The Chai Bar', city: 'Surrey', type: 'Restaurant', status: 'LIVE', orders: 34, revenue: 408, rating: 4.8, joined: 'May 1' },
  { id: 'ghar-surrey', name: 'Ghar Ka Khana', city: 'Surrey', type: 'Tiffin', status: 'PENDING', orders: 0, revenue: 0, rating: 0, joined: 'Applied today' },
];

const ORDERS = [
  { id: 'TG001', customer: 'Priya S.', kitchen: 'Chai Bar', driver: 'Arjun S.', amount: 12, status: 'ON_THE_WAY', city: 'Surrey' },
  { id: 'TG002', customer: 'Rahul M.', kitchen: 'Chai Bar', driver: 'Arjun S.', amount: 50, status: 'PREPARING', city: 'Surrey' },
  { id: 'TG003', customer: 'Simran K.', kitchen: 'Chai Bar', driver: 'Neha P.', amount: 12, status: 'DELIVERED', city: 'Surrey' },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  LIVE:       { bg: '#E3F5EE', color: '#2D9B6F' },
  PENDING:    { bg: '#FEF0E3', color: '#C85E0A' },
  SUSPENDED:  { bg: '#FFEBEB', color: '#C0392B' },
  ON_THE_WAY: { bg: '#E8EEFF', color: '#3B5BDB' },
  PREPARING:  { bg: '#FEF0E3', color: '#C85E0A' },
  DELIVERED:  { bg: '#F0F0EF', color: '#6B6B68' },
};

export default function AdminPanel() {
  const [tab, setTab] = useState<'overview' | 'kitchens' | 'orders' | 'drivers'>('overview');

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF5' }}>

      {/* Header */}
      <div style={{ background: '#1C1C1A' }} className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F07B22' }}>
            <span className="text-[18px]">⚡</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">ADMIN PANEL</p>
            <p className="text-[16px] font-semibold text-white">TiffinGo Command Centre</p>
          </div>
        </div>

        <div className="flex gap-1">
          {(['overview', 'kitchens', 'orders', 'drivers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-[11px] font-medium capitalize transition-all"
              style={{ background: tab === t ? '#F07B22' : '#2A2A28', color: tab === t ? '#fff' : '#666' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 max-w-2xl mx-auto">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: DollarSign, label: 'Platform GMV today', val: '$1,284', sub: 'Across all kitchens', color: '#F07B22' },
                { icon: Store, label: 'Active kitchens', val: '1', sub: '1 pending approval', color: '#2D9B6F' },
                { icon: Users, label: 'Total customers', val: '48', sub: 'Surrey launch', color: '#3B5BDB' },
                { icon: Truck, label: 'Active drivers', val: '3', sub: '2 on delivery now', color: '#F5C842' },
              ].map(({ icon: Icon, label, val, sub, color }) => (
                <div key={label} className="bg-white border border-[#EAEAE5] rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color }} />
                    <span className="text-[10px] text-[#6B6B68]">{label}</span>
                  </div>
                  <p className="text-[20px] font-bold text-[#1C1C1A]">{val}</p>
                  <p className="text-[10px] text-[#6B6B68] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* TiffinGo revenue */}
            <div className="bg-[#1C1C1A] rounded-2xl p-4 mb-4">
              <p className="text-[9px] font-semibold text-[#F07B22] tracking-wider mb-2">TIFFINGO REVENUE (10% COMMISSION)</p>
              <p className="text-[32px] font-bold text-white">$128.40</p>
              <p className="text-[12px] text-gray-500">Today · $3,840 projected this month</p>
            </div>

            {/* Pending approvals */}
            <p className="text-[12px] font-semibold text-[#1C1C1A] mb-2">Pending kitchen approvals</p>
            {KITCHENS.filter(k => k.status === 'PENDING').map(k => (
              <div key={k.id} className="bg-white border border-[#EAEAE5] rounded-2xl p-4 mb-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FEF0E3' }}>🍛</div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#1C1C1A]">{k.name}</p>
                    <p className="text-[11px] text-[#6B6B68]">{k.city} · {k.type} · {k.joined}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl text-[12px] font-medium text-white flex items-center justify-center gap-1.5" style={{ background: '#2D9B6F' }}>
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: '#FFEBEB', color: '#C0392B' }}>
                    <XCircle size={13} /> Reject
                  </button>
                  <button className="px-3 py-2.5 rounded-xl" style={{ background: '#F5F0E8' }}>
                    <Eye size={14} className="text-[#6B6B68]" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* KITCHENS */}
        {tab === 'kitchens' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-[#1C1C1A]">All kitchens</p>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#FEF0E3', color: '#C85E0A' }}>{KITCHENS.length} kitchens</span>
            </div>
            {KITCHENS.map(k => {
              const s = STATUS_COLORS[k.status];
              return (
                <div key={k.id} className="bg-white border border-[#EAEAE5] rounded-2xl p-4 mb-2.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FEF0E3' }}>🍛</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-[#1C1C1A]">{k.name}</p>
                        <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{k.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B6B68]">
                        <MapPin size={10} />
                        <span className="text-[11px]">{k.city} · {k.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F5F0E8]">
                    <div className="text-center">
                      <p className="text-[14px] font-bold text-[#1C1C1A]">{k.orders}</p>
                      <p className="text-[9px] text-[#6B6B68]">orders today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-bold text-[#1C1C1A]">${k.revenue}</p>
                      <p className="text-[9px] text-[#6B6B68]">GMV today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-bold text-[#1C1C1A]">{k.rating || '—'}</p>
                      <p className="text-[9px] text-[#6B6B68]">avg rating</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-[#1C1C1A]">Live orders</p>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: '#E3F5EE', color: '#2D9B6F' }}>{ORDERS.length} active</span>
            </div>
            {ORDERS.map(order => {
              const s = STATUS_COLORS[order.status];
              return (
                <div key={order.id} className="bg-white border border-[#EAEAE5] rounded-2xl p-4 mb-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-mono text-[#6B6B68]">#{order.id}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{order.status.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-[#6B6B68]">Customer</p>
                      <p className="text-[12px] font-medium text-[#1C1C1A]">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B6B68]">Kitchen</p>
                      <p className="text-[12px] font-medium text-[#1C1C1A]">{order.kitchen}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B6B68]">Driver</p>
                      <p className="text-[12px] font-medium text-[#1C1C1A]">{order.driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F0E8]">
                    <span className="text-[11px] text-[#6B6B68]">{order.city}</span>
                    <span className="text-[14px] font-bold text-[#1C1C1A]">${order.amount}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* DRIVERS */}
        {tab === 'drivers' && (
          <>
            <p className="text-[14px] font-semibold text-[#1C1C1A] mb-3">Active drivers</p>
            {[
              { name: 'Arjun S.', status: 'ON_DELIVERY', deliveries: 6, earnings: 68.40, rating: 4.97 },
              { name: 'Neha P.', status: 'ON_DELIVERY', deliveries: 4, earnings: 42.80, rating: 4.92 },
              { name: 'Raj K.', status: 'ONLINE', deliveries: 2, earnings: 18.60, rating: 4.85 },
            ].map(driver => (
              <div key={driver.name} className="bg-white border border-[#EAEAE5] rounded-2xl p-4 mb-2.5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: '#FEF0E3' }}>🧑</div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#1C1C1A]">{driver.name}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: driver.status === 'ON_DELIVERY' ? '#E8EEFF' : '#E3F5EE', color: driver.status === 'ON_DELIVERY' ? '#3B5BDB' : '#2D9B6F' }}>
                      {driver.status === 'ON_DELIVERY' ? 'On delivery' : 'Online'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F5F0E8]">
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-[#1C1C1A]">{driver.deliveries}</p>
                    <p className="text-[9px] text-[#6B6B68]">deliveries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-[#F07B22]">${driver.earnings.toFixed(2)}</p>
                    <p className="text-[9px] text-[#6B6B68]">earned today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-[#1C1C1A]">★ {driver.rating}</p>
                    <p className="text-[9px] text-[#6B6B68]">rating</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

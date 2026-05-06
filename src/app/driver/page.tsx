'use client';
import { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Power, Package, Navigation } from 'lucide-react';

type Order = { id: string; kitchen: string; customer: string; meal: string; pickupAddr: string; dropAddr: string; distance: string; earnings: number; time: string; status: 'pending'|'accepted'|'picked'; };

const MOCK: Order[] = [
  { id: 'D001', kitchen: 'The Chai Bar', customer: 'Priya S.', meal: 'Masala Chai + Paneer Paratha', pickupAddr: '123 King George Blvd', dropAddr: '456 152nd St, Surrey', distance: '1.8 km', earnings: 7.40, time: '12:00pm', status: 'pending' },
  { id: 'D002', kitchen: 'Ghar Ka Khana', customer: 'Rahul M.', meal: 'Dal Tadka + Rice', pickupAddr: '78 Scott Rd', dropAddr: '234 72nd Ave, Surrey', distance: '2.4 km', earnings: 8.20, time: '12:00pm', status: 'pending' },
];

export default function DriverApp() {
  const [online, setOnline] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [active, setActive] = useState<Order | null>(null);
  const [earnings, setEarnings] = useState(68.40);
  const [deliveries, setDeliveries] = useState(6);

  useEffect(() => {
    if (online) { const t = setTimeout(() => setOrders(MOCK), 1200); return () => clearTimeout(t); }
    else setOrders([]);
  }, [online]);

  function accept(o: Order) { setActive({ ...o, status: 'accepted' }); setOrders(p => p.filter(x => x.id !== o.id)); }

  function advance() {
    if (!active) return;
    if (active.status === 'accepted') setActive({ ...active, status: 'picked' });
    else { setEarnings(e => e + active.earnings); setDeliveries(d => d + 1); setActive(null); }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0F110E' }}>
      {/* Header */}
      <div style={{ background: '#1A2E1A', borderBottom: '0.5px solid #2D5A2D' }} className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-medium" style={{ color: '#9FBF9F' }}>DRIVER APP</p>
            <p className="text-[16px] font-semibold text-white">Arjun S.</p>
          </div>
          <button onClick={() => setOnline(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-[13px] transition-all"
            style={{ background: online ? '#E8A020' : '#2D5A2D', color: online ? '#1A2E1A' : '#9FBF9F' }}>
            <Power size={14} />
            {online ? 'Online' : 'Go online'}
          </button>
        </div>
        <div className="flex gap-3">
          {[
            { icon: DollarSign, val: `$${earnings.toFixed(2)}`, label: 'Today', color: '#E8A020' },
            { icon: Package, val: deliveries.toString(), label: 'Deliveries', color: '#9FBF9F' },
            { icon: Star, val: '4.97', label: 'Rating', color: '#E8A020' },
          ].map(({ icon: Icon, val, label, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3" style={{ background: '#2D5A2D' }}>
              <Icon size={13} style={{ color }} />
              <p className="text-[17px] font-bold text-white mt-1">{val}</p>
              <p className="text-[10px]" style={{ color: '#9FBF9F' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Active order */}
        {active && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1A2E1A', border: `1px solid #E8A020` }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#E8A020' }}>
              <Navigation size={13} style={{ color: '#1A2E1A' }} />
              <p className="text-[11px] font-bold" style={{ color: '#1A2E1A' }}>
                {active.status === 'accepted' ? '📍 HEAD TO KITCHEN' : '🏠 HEAD TO CUSTOMER'}
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#2D5A2D' }}>🍵</div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">{active.customer}</p>
                  <p className="text-[11px]" style={{ color: '#9FBF9F' }}>{active.meal}</p>
                </div>
                <span className="text-[20px] font-bold" style={{ color: '#E8A020' }}>${active.earnings.toFixed(2)}</span>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: active.status === 'accepted' ? 'PICKUP' : '✅ PICKED', addr: active.pickupAddr, done: active.status === 'picked', color: '#E8A020' },
                  { label: 'DROP OFF', addr: active.dropAddr, done: false, color: '#9FBF9F' },
                ].map(loc => (
                  <div key={loc.label} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ background: loc.color, color: '#1A2E1A' }}>{loc.label[0]}</div>
                    <div>
                      <p className="text-[10px] font-semibold" style={{ color: loc.color }}>{loc.label}</p>
                      <p className="text-[12px] text-white">{loc.addr}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={advance} className="w-full py-3.5 rounded-2xl text-[14px] font-bold" style={{ background: '#E8A020', color: '#1A2E1A' }}>
                {active.status === 'accepted' ? '✅ Picked up — heading to customer' : '🎉 Delivered!'}
              </button>
            </div>
          </div>
        )}

        {/* Incoming orders */}
        {!active && online && orders.length > 0 && orders.map(order => (
          <div key={order.id} className="rounded-2xl p-4" style={{ background: '#1A2E1A', border: '0.5px solid #2D5A2D' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#2D5A2D' }}>🍵</div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white">{order.kitchen}</p>
                <p className="text-[11px]" style={{ color: '#9FBF9F' }}>{order.meal}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#7A9A7A' }}><MapPin size={10} />{order.distance}</span>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#7A9A7A' }}><Clock size={10} />{order.time}</span>
                </div>
              </div>
              <p className="text-[20px] font-bold" style={{ color: '#E8A020' }}>${order.earnings.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOrders(o => o.filter(x => x.id !== order.id))}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-medium" style={{ background: '#2D5A2D', color: '#9FBF9F' }}>
                Decline
              </button>
              <button onClick={() => accept(order)} className="flex-[2] py-2.5 rounded-xl text-[13px] font-bold" style={{ background: '#E8A020', color: '#1A2E1A' }}>
                Accept ↗
              </button>
            </div>
          </div>
        ))}

        {/* Offline */}
        {!online && !active && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#1A2E1A' }}>
              <Power size={28} style={{ color: '#2D5A2D' }} />
            </div>
            <p className="text-[18px] font-semibold text-white mb-2">You're offline</p>
            <p className="text-[13px] mb-6" style={{ color: '#7A9A7A' }}>Go online to receive delivery requests</p>
            <button onClick={() => setOnline(true)} className="px-8 py-4 rounded-2xl text-[15px] font-bold" style={{ background: '#E8A020', color: '#1A2E1A' }}>
              Go online
            </button>
          </div>
        )}

        {/* Online waiting */}
        {online && orders.length === 0 && !active && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: '#1A2E1A' }}>
              <span className="text-[32px]">🛵</span>
            </div>
            <p className="text-[16px] font-semibold text-white mb-1">Looking for orders...</p>
            <p className="text-[13px]" style={{ color: '#7A9A7A' }}>You'll be notified when a delivery is ready</p>
          </div>
        )}
      </div>
    </div>
  );
}

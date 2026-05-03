'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import clsx from 'clsx';

const STATUSES = [
  { key: 'CONFIRMED',  label: 'Order confirmed' },
  { key: 'PREPARING',  label: 'Kitchen prepared' },
  { key: 'ON_THE_WAY', label: 'On the way'       },
  { key: 'DELIVERED',  label: 'Delivered'         },
] as const;

type Status = typeof STATUSES[number]['key'];

// Simulated driver path (lat/lng offsets for the schematic map)
const DRIVER_PATH = [
  { x: 150, y: 110 },
  { x: 120, y: 110 },
  { x: 90,  y: 110 },
  { x: 80,  y: 140 },
  { x: 80,  y: 170 },
];

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('ON_THE_WAY');
  const [driverPos, setDriverPos] = useState(DRIVER_PATH[0]);
  const [eta, setEta] = useState(12);
  const [pathIdx, setPathIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPathIdx(prev => {
        if (prev >= DRIVER_PATH.length - 1) {
          clearInterval(interval);
          setStatus('DELIVERED');
          setEta(0);
          return prev;
        }
        const next = prev + 1;
        setDriverPos(DRIVER_PATH[next]);
        setEta(p => Math.max(0, p - 2));
        if (next === DRIVER_PATH.length - 1) setStatus('DELIVERED');
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentStep = STATUSES.findIndex(s => s.key === status);
  const progress = ((currentStep + 1) / STATUSES.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* Status bar */}
      <div className="bg-[#FAFAF8] px-5 pt-14 pb-2 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 bg-white border border-[#E8E5DE] rounded-full flex items-center justify-center">
          <ArrowLeft size={14} className="text-[#2C2C2A]" />
        </button>
        <h1 className="font-serif text-[19px] text-[#2C2C2A]">Order tracking</h1>
      </div>

      {/* Schematic map */}
      <div className="mx-5 bg-[#EEEEE9] rounded-3xl overflow-hidden relative" style={{ height: 220 }}>
        <svg width="100%" height="100%" viewBox="0 0 300 220" fill="none">
          {/* Grid roads */}
          <rect x="0" y="46" width="300" height="8" fill="#fff" opacity="0.7" />
          <rect x="0" y="106" width="300" height="8" fill="#fff" opacity="0.7" />
          <rect x="0" y="166" width="300" height="8" fill="#fff" opacity="0.7" />
          <rect x="56" y="0" width="8" height="220" fill="#fff" opacity="0.7" />
          <rect x="146" y="0" width="8" height="220" fill="#fff" opacity="0.7" />
          <rect x="236" y="0" width="8" height="220" fill="#fff" opacity="0.7" />

          {/* City blocks */}
          {[[64,54,74,44],[154,54,74,44],[6,54,42,44],[64,114,74,44],[154,114,74,44],[244,114,54,44]].map(([x,y,w,h],i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#E0E0DA" />
          ))}

          {/* Route */}
          <path d={`M80 170 L80 108 L150 108 L150 46 L220 46`} stroke="#1D9E75" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" opacity="0.7" />

          {/* Kitchen pin */}
          <g transform="translate(206,34)">
            <path d="M14 0C7.37 0 2 5.37 2 12c0 8.75 12 20 12 20S26 20.75 26 12C26 5.37 20.63 0 14 0z" fill="#2C2C2A" />
            <text x="14" y="14" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#fff">🍛</text>
          </g>

          {/* Home pin with pulse */}
          <circle cx="80" cy="170" r="12" fill="#1D9E75" opacity="0.2">
            <animate attributeName="r" from="10" to="18" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <g transform="translate(66,158)">
            <path d="M14 0C7.37 0 2 5.37 2 12c0 8.75 12 20 12 20S26 20.75 26 12C26 5.37 20.63 0 14 0z" fill="#1D9E75" />
            <path d="M14 6l7 5.5v8h-4v-5h-6v5H7v-8z" fill="#fff" />
          </g>

          {/* Driver pin */}
          <g transform={`translate(${driverPos.x - 14},${driverPos.y - 14})`} style={{ transition: 'transform 2s ease-in-out' }}>
            <circle cx="14" cy="14" r="13" fill="#fff" stroke="#1D9E75" strokeWidth="1.5" />
            <text x="14" y="15" textAnchor="middle" dominantBaseline="central" fontSize="12">🛵</text>
          </g>
        </svg>

        {/* ETA pill */}
        <div className="absolute top-3 right-3 bg-[#2C2C2A] text-white rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#9FE1CB" strokeWidth="1"/><path d="M5.5 3v2.5l1.5 1.5" stroke="#9FE1CB" strokeWidth="1" strokeLinecap="round"/></svg>
          <span className="text-[11px] font-medium">
            {status === 'DELIVERED' ? 'Delivered!' : `Arriving in ${eta} min`}
          </span>
        </div>
      </div>

      {/* Status card */}
      <div className="mx-5 mt-4">
        <div className="card p-4">
          {/* Status header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#1D9E75" strokeWidth="1.3"/><path d="M6 9l2.5 2.5L12 6.5" stroke="#1D9E75" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <p className="text-[16px] font-medium text-[#2C2C2A]">
                {status === 'DELIVERED' ? 'Delivered!' : status === 'ON_THE_WAY' ? 'On the way' : status === 'PREPARING' ? 'Preparing' : 'Confirmed'}
              </p>
              <p className="text-[11px] text-[#888780]">
                {status === 'DELIVERED' ? 'Enjoy your meal!' : 'Arjun is heading to you · 1.2 km away'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#F1EFE8] rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[#1D9E75] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Steps */}
          <div className="flex justify-between">
            {STATUSES.map((s, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={s.key} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    done ? 'bg-[#888780]' : active ? 'bg-[#2C2C2A]' : 'bg-[#F1EFE8]'
                  )}>
                    {done
                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : active
                        ? <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        : null
                    }
                  </div>
                  <p className={clsx('text-[9px] font-medium text-center leading-tight', active ? 'text-[#2C2C2A]' : done ? 'text-[#1D9E75]' : 'text-[#B4B2A9]')}>
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Driver card */}
      <div className="mx-5 mt-3">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#FAEEDA] flex items-center justify-center text-xl flex-shrink-0 border-2 border-white shadow-sm">
            🧑
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[#2C2C2A]">Arjun S.</p>
            <p className="text-[11px] text-[#888780]">Honda Activa · MH 04 BX 2219</p>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="9" height="9" viewBox="0 0 9 9" fill="#EF9F27"><path d="M4.5 0l1.1 3.1h3.3L6.3 5l1.1 3.1L4.5 6.4 1.6 8.1 2.7 5 .1 3.1h3.3z"/></svg>
              ))}
              <span className="text-[10px] text-[#888780] ml-0.5">4.97 · 1,204 deliveries</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-[#F1EFE8] flex items-center justify-center border border-[#E8E5DE]">
              <Phone size={14} className="text-[#5F5E5A]" />
            </button>
            <button className="w-9 h-9 rounded-full bg-[#F1EFE8] flex items-center justify-center border border-[#E8E5DE]">
              <MessageSquare size={14} className="text-[#5F5E5A]" />
            </button>
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="mx-5 mt-3">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-xl flex-shrink-0">🍛</div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[#2C2C2A]">Ghar Ka Khana</p>
            <p className="text-[11px] text-[#888780]">Dal makhani + rice · weekly plan</p>
          </div>
          <span className="text-[11px] font-medium text-[#5F5E5A] bg-[#F1EFE8] px-2 py-1 rounded-lg">1 item</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mx-5 mt-4 flex gap-2">
        <button className="flex-1 py-3 bg-white border border-[#E8E5DE] rounded-2xl text-[12px] font-medium text-[#5F5E5A]">
          Cancel
        </button>
        <button className="flex-[2] py-3 bg-[#2C2C2A] text-white rounded-2xl text-[13px] font-medium flex items-center justify-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#9FE1CB" strokeWidth="1.1"/><path d="M6.5 4v2.5l1.5 1.5" stroke="#9FE1CB" strokeWidth="1.1" strokeLinecap="round"/></svg>
          Live support
        </button>
      </div>

      <NavBar />
    </div>
  );
}

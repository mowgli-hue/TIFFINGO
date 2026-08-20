'use client';
import Link from 'next/link';
import { Star, Clock, MapPin } from 'lucide-react';
import { Kitchen } from '@/lib/types';
import clsx from 'clsx';

export default function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  return (
    <Link href={`/kitchen/${kitchen.id}`} className="block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image / colour header */}
        <div
          className={clsx(
            'h-32 flex items-center justify-center text-4xl relative',
            kitchen.type === 'tiffin' ? 'bg-[#FFFBEB]' : 'bg-[#FAEEDA]'
          )}
        >
          <span>{kitchen.cuisine === 'Healthy' ? '🥗' : kitchen.cuisine === 'Vegan' ? '🌿' : '🍛'}</span>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {kitchen.type === 'tiffin' && (
              <span className="bg-[#1A3A2A] text-white text-[9px] font-medium px-2 py-0.5 rounded-full">
                Plan
              </span>
            )}
            {kitchen.isHalal && (
              <span className="bg-white text-[#5F5E5A] text-[9px] font-medium px-2 py-0.5 rounded-full border border-[#D8DDD0]">
                Halal
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute top-2 right-2 bg-white rounded-lg px-2 py-0.5 flex items-center gap-1 border border-[#D8DDD0]">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-medium text-[#1A3A2A]">{kitchen.rating}</span>
          </div>

          {/* Closed overlay */}
          {!kitchen.isOpen && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-[11px] font-medium text-[#8A9A8A]">Closed now</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="text-[13px] font-medium text-[#1A3A2A] mb-0.5">{kitchen.name}</h3>
          <p className="text-[11px] text-[#8A9A8A] mb-2">{kitchen.cuisine} · {kitchen.type === 'tiffin' ? 'Home kitchen' : 'Restaurant'}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#8A9A8A]">
              <Clock size={11} />
              <span className="text-[11px]">{kitchen.cutoffTime}</span>
            </div>
            {kitchen.pricePerMeal && (
              <span className="text-[12px] font-medium text-[#1A3A2A]">${kitchen.pricePerMeal}/meal</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

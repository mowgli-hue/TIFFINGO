'use client';
import clsx from 'clsx';
import { PLANS } from '@/lib/stripe';

type Plan = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface Props {
  plan: Plan;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

export default function PlanCard({ plan, selected, onSelect }: Props) {
  const data = PLANS[plan];

  return (
    <button
      onClick={() => onSelect(plan)}
      className={clsx(
        'relative flex-1 rounded-2xl border p-3 text-left transition-all duration-150',
        selected
          ? 'border-[#1D9E75] border-[1.5px] bg-[#f4fbf8]'
          : 'border-[#E8E5DE] bg-white'
      )}
    >
      {'popular' in data && data.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-[9px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
          Most popular
        </span>
      )}

      <p className="text-[10px] font-medium text-[#888780] tracking-wider mb-1">
        {plan}
      </p>

      <div className="flex items-baseline gap-0.5 mb-1">
        <span className="text-[18px] font-medium text-[#2C2C2A]">
          ${plan === 'MONTHLY' ? data.pricePerWeek.toFixed(2) : data.pricePerWeek}
        </span>
        <span className="text-[10px] text-[#888780]">/{plan === 'MONTHLY' ? 'wk' : 'wk'}</span>
      </div>

      <p className="text-[10px] text-[#5F5E5A]">{data.description}</p>

      {data.savingsPct > 0 && (
        <span className="mt-1.5 inline-block text-[9px] font-medium text-[#1D9E75]">
          Save {data.savingsPct}%
        </span>
      )}
    </button>
  );
}

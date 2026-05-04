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
          ? 'border-[#C8522A] border-[1.5px] bg-[#FFF8F4]'
          : 'border-[#E8DDD0] bg-white'
      )}
    >
      {'popular' in data && data.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#C8522A] text-white text-[9px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
          Most popular
        </span>
      )}

      <p className="text-[10px] font-medium text-[#9A8A7A] tracking-wider mb-1">
        {plan}
      </p>

      <div className="flex items-baseline gap-0.5 mb-1">
        <span className="text-[18px] font-medium text-[#2C1810]">
          ${plan === 'MONTHLY' ? data.pricePerWeek.toFixed(2) : data.pricePerWeek}
        </span>
        <span className="text-[10px] text-[#9A8A7A]">/{plan === 'MONTHLY' ? 'wk' : 'wk'}</span>
      </div>

      <p className="text-[10px] text-[#5F5E5A]">{data.description}</p>

      {data.savingsPct > 0 && (
        <span className="mt-1.5 inline-block text-[9px] font-medium text-[#C8522A]">
          Save {data.savingsPct}%
        </span>
      )}
    </button>
  );
}

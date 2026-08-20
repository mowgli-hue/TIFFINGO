'use client';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useCart } from '@/store/cart';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { kitchenName, mealName, day, isWeekly, clearCart } = useCart();

  if (!open || !kitchenName) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F5F0] rounded-t-3xl max-w-md mx-auto p-5 pb-8">
        <div className="w-10 h-1 bg-[#D8DDD0] rounded-full mx-auto mb-4" />
        <h3 className="text-[15px] font-medium text-[#1A3A2A] mb-1">{kitchenName}</h3>
        <p className="text-[13px] text-[#8A9A8A] mb-1">{isWeekly ? 'Weekly package — all 5 meals' : `${day}'s meal — ${mealName}`}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { clearCart(); onClose(); }} className="flex-1 py-3 border border-[#D8DDD0] rounded-2xl text-[13px] text-[#5A6B5A]">Remove</button>
          <button onClick={() => { onClose(); router.push('/checkout'); }} className="flex-[2] py-3 rounded-2xl text-[13px] font-medium text-white" style={{ background: '#1A3A2A' }}>Checkout →</button>
        </div>
      </div>
    </>
  );
}

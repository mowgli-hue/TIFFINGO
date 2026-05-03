'use client';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import clsx from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { items, kitchenName, updateQty, removeItem, totalAmount, selectedPlan } = useCart();

  if (!open) return null;

  const total = totalAmount();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF8] rounded-t-3xl max-h-[80vh] flex flex-col max-w-md mx-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#D3D1C7] rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E5DE]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-[#1D9E75]" />
            <span className="text-[14px] font-medium text-[#2C2C2A]">{kitchenName ?? 'Your order'}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F1EFE8] flex items-center justify-center">
            <X size={13} className="text-[#5F5E5A]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <p className="text-[13px] text-[#888780] text-center py-8">Your cart is empty</p>
          ) : (
            items.map(item => (
              <div key={item.menuItemId} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#2C2C2A]">{item.name}</p>
                  <p className="text-[12px] text-[#888780]">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-[#F1EFE8] flex items-center justify-center"
                  >
                    <Minus size={11} className="text-[#5F5E5A]" />
                  </button>
                  <span className="text-[13px] font-medium w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-[#2C2C2A] flex items-center justify-center"
                  >
                    <Plus size={11} className="text-white" />
                  </button>
                </div>
                <span className="text-[13px] font-medium text-[#2C2C2A] w-14 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 pb-8 pt-3 border-t border-[#E8E5DE] space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#5F5E5A]">Subtotal</span>
              <span className="font-medium text-[#2C2C2A]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#5F5E5A]">Delivery</span>
              <span className="font-medium text-[#1D9E75]">Free</span>
            </div>
            <button
              onClick={() => { onClose(); router.push('/checkout'); }}
              className="w-full py-3.5 bg-[#2C2C2A] text-white rounded-2xl text-[14px] font-medium flex items-center justify-between px-5"
            >
              <span>Go to checkout</span>
              <span className="text-[#9FE1CB] text-[12px]">${total.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

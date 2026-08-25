'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/store/cart';
import clsx from 'clsx';

const NAV = [
  { href: '/home',    icon: Home,        label: 'Home'    },
  { href: '/explore', icon: Search,      label: 'Explore' },
  { href: '/orders',  icon: ShoppingBag, label: 'Orders'  },
  { href: '/profile', icon: User,        label: 'Profile' },
];

export default function NavBar() {
  const pathname = usePathname();
  const kitchenId = useCart(s => s.kitchenId);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t" style={{ borderColor: '#D8DDD0', boxShadow: '0 -2px 16px rgba(26,58,42,0.06)' }}>
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2 pb-safe">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all">
              <div className="relative">
                <Icon size={21} strokeWidth={active ? 2.2 : 1.5} color={active ? '#1A3A2A' : '#A8B4A8'} />
                {href === '/orders' && kitchenId && (
                  <span className="absolute -top-1 -right-1.5 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#F0B429', color: '#1A3A2A' }}>1</span>
                )}
              </div>
              <span className="text-[9px] font-medium" style={{ color: active ? '#1A3A2A' : '#A8B4A8' }}>{label}</span>
              {active && <div className="w-1 h-1 rounded-full" style={{ background: '#F0B429' }} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

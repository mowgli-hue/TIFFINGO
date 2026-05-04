'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/store/cart';
import clsx from 'clsx';

const NAV = [
  { href: '/',        icon: Home,        label: 'Home'    },
  { href: '/explore', icon: Search,      label: 'Explore' },
  { href: '/orders',  icon: ShoppingBag, label: 'Orders'  },
  { href: '/profile', icon: User,        label: 'Profile' },
];

export default function NavBar() {
  const pathname = usePathname();
  const items = useCart(s => s.items);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8DDD0]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2 pb-safe">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all',
                active ? 'text-[#2C1810]' : 'text-[#B4B2A9]'
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                {href === '/orders' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#C8522A] text-white text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={clsx('text-[9px] font-medium', active ? 'text-[#2C1810]' : 'text-[#B4B2A9]')}>
                {label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-[#C8522A]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

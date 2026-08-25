'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/cart';

/* Sending someone to /auth/login while their session cookie is still valid
   just walks them back into the page that bounced them. Clear it first. */
export default function SwitchAccount() {
  const router = useRouter();
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await logout(); } catch { /* cookie may already be gone */ }
        router.replace('/auth/login');
        router.refresh();
      }}
      className="w-full py-2.5 text-[13px] font-medium disabled:opacity-50"
      style={{ color: '#5A6B5A' }}
    >
      {busy ? 'Signing out…' : 'Sign out and use another account'}
    </button>
  );
}

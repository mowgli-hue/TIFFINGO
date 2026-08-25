import Link from 'next/link';
import { Suspense } from 'react';

const D = '#043F28';
const A = '#FEB001';
const LT = '#FFF8E8';
const BR = '#E6E3DA';

const COPY: Record<string, { title: string; body: string }> = {
  merchant: {
    title: 'That area is for kitchens',
    body: 'The dashboard opens once your kitchen application has been approved. If you have already applied, we will email you the moment it is live.',
  },
  admin: {
    title: 'That area is for TiffinGo staff',
    body: 'Nothing here for a customer or a kitchen account.',
  },
  driver: {
    title: 'That area is for drivers',
    body: 'Driver accounts are set up by TiffinGo. Email us if you want to deliver for us.',
  },
};

function Body({ need }: { need?: string }) {
  const copy = COPY[need ?? ''] ?? {
    title: 'You do not have access to that page',
    body: 'Your account is signed in, but it is not the right kind of account for that area.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F5F5F0' }}>
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-[26px]" style={{ background: LT }}>
          🔒
        </div>
        <h1 className="text-[20px] font-bold mb-2" style={{ color: D, fontFamily: 'Fraunces, serif' }}>
          {copy.title}
        </h1>
        <p className="text-[13.5px] leading-relaxed mb-7" style={{ color: '#5A6B5A' }}>{copy.body}</p>

        <div className="space-y-2.5">
          <Link href="/explore"
            className="block w-full py-3.5 rounded-2xl text-[14px] font-bold"
            style={{ background: D, color: A }}>
            Browse this week&rsquo;s menus
          </Link>
          <Link href="/join"
            className="block w-full py-3.5 rounded-2xl text-[13.5px] font-semibold"
            style={{ background: '#fff', color: D, border: `0.5px solid ${BR}` }}>
            Apply as a kitchen
          </Link>
          <Link href="/auth/login"
            className="block w-full py-2.5 text-[13px] font-medium" style={{ color: '#5A6B5A' }}>
            Sign in with a different account
          </Link>
        </div>

        <p className="text-[11.5px] mt-6" style={{ color: '#8A9A8A' }}>
          Think this is wrong? Email tiffingo.app@gmail.com
        </p>
      </div>
    </div>
  );
}

export default function NoAccess({ searchParams }: { searchParams?: { need?: string } }) {
  return (
    <Suspense>
      <Body need={searchParams?.need} />
    </Suspense>
  );
}

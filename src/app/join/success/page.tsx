'use client';
import Link from 'next/link';

export default function JoinSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#F5F5F0' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#1A3A2A' }}>
          <span className="text-[36px]">🎉</span>
        </div>
        <h1 className="text-[24px] font-bold mb-2" style={{ color: '#1A3A2A', fontFamily: 'Fraunces, serif' }}>
          You're in!
        </h1>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#8A9A8A' }}>
          Your kitchen and AI-generated meal calendar have been submitted. Our team reviews every kitchen within 24 hours — you'll get an email the moment you're approved and live.
        </p>
        <div className="rounded-2xl p-4 bg-white text-left mb-6" style={{ border: '0.5px solid #D8DDD0' }}>
          <p className="text-[11px] font-bold mb-2.5" style={{ color: '#C8941A' }}>WHAT HAPPENS NEXT</p>
          {[
            '1. We review your kitchen (within 24h)',
            '2. You get an approval email + dashboard access',
            '3. Your meals go live on TiffinGo',
            '4. First orders can arrive same day',
          ].map(s => (
            <p key={s} className="text-[12px] mb-1.5 last:mb-0" style={{ color: '#5A6B5A' }}>{s}</p>
          ))}
        </div>
        <Link href="/">
          <button className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white" style={{ background: '#1A3A2A' }}>
            Back to TiffinGo
          </button>
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const D = '#043F28', BR = '#E6E3DA';

export default function LegalShell({
  title, updated, children,
}: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      <div className="px-5 pt-12 pb-5" style={{ background: `linear-gradient(160deg, ${D}, #0A5533)` }}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] mb-3" style={{ color: '#C9DDD1' }}>
          <ArrowLeft size={13} /> TiffinGo
        </Link>
        <h1 className="text-[22px] font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>{title}</h1>
        <p className="text-[11.5px] mt-1" style={{ color: '#C9DDD1' }}>Last updated {updated}</p>
      </div>
      <div className="px-5 py-6 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-white p-5 space-y-5" style={{ border: `0.5px solid ${BR}` }}>
          {children}
        </div>
        <p className="text-[11.5px] text-center mt-5" style={{ color: '#8A9A8A' }}>
          Questions? <a href="mailto:tiffingo.app@gmail.com" className="font-semibold" style={{ color: '#C8941A' }}>tiffingo.app@gmail.com</a>
        </p>
      </div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[14px] font-bold mb-1.5" style={{ color: D }}>{heading}</h2>
      <div className="text-[13px] leading-relaxed space-y-2" style={{ color: '#4A5A4A' }}>{children}</div>
    </section>
  );
}

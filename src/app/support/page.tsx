import type { Metadata } from 'next';
import Link from 'next/link';
import LegalShell, { Section } from '../legal/LegalShell';

export const metadata: Metadata = {
  title: 'Support — TiffinGo',
  description: 'Get help with an order, a plan, or your account.',
};

export default function SupportPage() {
  return (
    <LegalShell title="Support" updated="10 September 2026">
      <Section heading="Talk to a person">
        <p>
          Email <a href="mailto:tiffingo.app@gmail.com" className="font-semibold" style={{ color: '#C8941A' }}>tiffingo.app@gmail.com</a>.
          We are a small team in Surrey and answer within one business day.
        </p>
        <p>Tell us your account email and, if it is about an order, roughly when you placed it — that is enough for us to find it.</p>
      </Section>

      <Section heading="Something went wrong with a delivery">
        <p>Message us within 48 hours. We will sort it out with the kitchen and refund where a refund is due.</p>
      </Section>

      <Section heading="I want to change or stop my plan">
        <p>Open the <Link href="/planner" className="font-semibold" style={{ color: '#C8941A' }}>Plan</Link> tab. Pause and cancel are both there, and take effect from next week.</p>
      </Section>

      <Section heading="I want my account deleted">
        <p>Open <Link href="/profile" className="font-semibold" style={{ color: '#C8941A' }}>Profile</Link> and choose &ldquo;Delete my account&rdquo;. It is immediate and permanent. If you would rather we did it, email us.</p>
      </Section>

      <Section heading="I cook, and I want to list my kitchen">
        <p>Start at <Link href="/join" className="font-semibold" style={{ color: '#C8941A' }}>Join as a kitchen</Link>. You can import your existing menu from a link, a PDF or a photo, and we build the weekly combos with you.</p>
      </Section>

      <Section heading="Legal">
        <p>
          <Link href="/legal/privacy" className="font-semibold" style={{ color: '#C8941A' }}>Privacy Policy</Link>
          {' · '}
          <Link href="/legal/terms" className="font-semibold" style={{ color: '#C8941A' }}>Terms of Service</Link>
        </p>
      </Section>
    </LegalShell>
  );
}

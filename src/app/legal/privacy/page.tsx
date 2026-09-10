import type { Metadata } from 'next';
import LegalShell, { Section } from '../LegalShell';

export const metadata: Metadata = {
  title: 'Privacy Policy — TiffinGo',
  description: 'What TiffinGo collects, why, and how to get it deleted.',
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="10 September 2026">
      <Section heading="Who we are">
        <p>
          TiffinGo is operated by Jungle Labs Inc. in Surrey, British Columbia, Canada.
          We connect people who want home-style Indian meals with local kitchens that cook them.
          You can reach us any time at tiffingo.app@gmail.com.
        </p>
      </Section>

      <Section heading="What we collect">
        <p><strong>When you create an account:</strong> your name, email address, and a password we store only as a one-way hash — we never see or keep the password itself.</p>
        <p><strong>When you order:</strong> the delivery address you type, your delivery time preference, and what you ordered.</p>
        <p><strong>When you pay:</strong> nothing. Card details go directly from your device to Stripe, our payment processor, and never touch our servers. We store only Stripe&rsquo;s identifiers so we can show you your own orders.</p>
        <p><strong>When you plan a week:</strong> the diet and calorie preferences you choose. Your calorie target is stored on your own device, not on our servers.</p>
        <p><strong>If you run a kitchen:</strong> your business name, address, menu, and — if you connect payouts — the banking details you give to Stripe directly.</p>
      </Section>

      <Section heading="What we do with it">
        <p>We use your information to take your order, get food to your door, show you your history, and answer you when you contact us. That is the whole list.</p>
        <p>We do not sell your personal information. We do not share it with advertisers. We do not build advertising profiles.</p>
      </Section>

      <Section heading="Who else sees it">
        <p><strong>The kitchen cooking your food</strong> sees your first name, order, and delivery address — they cannot deliver without it.</p>
        <p><strong>Stripe</strong> processes payments and payouts under its own privacy policy at stripe.com/privacy.</p>
        <p><strong>Supabase</strong> hosts our database, and <strong>Vercel</strong> hosts the application. Both act on our instructions only.</p>
        <p><strong>Anthropic</strong> receives menu text and your diet preferences when you use meal planning, so Claude can build your week. It is not used to train models and is not linked to your name or address.</p>
      </Section>

      <Section heading="Deleting your account">
        <p>
          Open <strong>Profile → Delete my account</strong> in the app. This permanently deletes your account,
          your saved preferences, your order history, and your customer record at Stripe. Any pending
          authorization hold on your card is released first, so you are not charged.
        </p>
        <p>
          If you run a kitchen, the kitchen listing is closed and detached from you rather than deleted,
          so that customers mid-week are not left without their meals.
        </p>
        <p>If you would rather we did it for you, email tiffingo.app@gmail.com and we will action it within 30 days.</p>
      </Section>

      <Section heading="How long we keep things">
        <p>Account and order data stays until you delete your account. Records we are legally required to keep for tax purposes are retained in anonymized form with no name, email, or address attached.</p>
      </Section>

      <Section heading="Your rights">
        <p>
          Under British Columbia&rsquo;s Personal Information Protection Act and Canada&rsquo;s PIPEDA, you can ask
          what we hold about you, ask us to correct it, and ask us to delete it. Email us and we will
          respond within 30 days at no charge.
        </p>
      </Section>

      <Section heading="Children">
        <p>TiffinGo is not intended for anyone under 13, and we do not knowingly collect information from children. If you believe a child has created an account, email us and we will remove it.</p>
      </Section>

      <Section heading="Security">
        <p>Traffic is encrypted in transit. Passwords are hashed with bcrypt. Card data never reaches our servers. Sessions use signed, http-only cookies. No system is perfect — if we ever discover a breach affecting you, we will tell you and the relevant regulator promptly.</p>
      </Section>

      <Section heading="Changes">
        <p>If we change this policy in a way that affects you, we will show a notice in the app before the change takes effect.</p>
      </Section>
    </LegalShell>
  );
}

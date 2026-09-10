import type { Metadata } from 'next';
import LegalShell, { Section } from '../LegalShell';

export const metadata: Metadata = {
  title: 'Terms of Service — TiffinGo',
  description: 'The agreement between you and TiffinGo.',
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="10 September 2026">
      <Section heading="The short version">
        <p>
          TiffinGo is a marketplace. Independent kitchens cook and sell the food; we handle the
          ordering, the planning and the payment. Your contract for the meal is with the kitchen.
          Our contract with you is for the service that connects you.
        </p>
      </Section>

      <Section heading="Your account">
        <p>You need an account to order. Keep your password to yourself — anything done through your account is treated as done by you. You must be 13 or older, and old enough to enter a contract where you live.</p>
      </Section>

      <Section heading="Ordering and payment">
        <p>
          When you reserve a week, we place an <strong>authorization hold</strong> on your card for the
          weekly total. That is not a charge. Your card is charged only when the kitchen confirms it can
          cook your week, at the daily 8:00pm cut-off.
        </p>
        <p>If a kitchen cannot fulfil your week, the hold is released and you pay nothing.</p>
        <p>Prices are shown in Canadian dollars and include the kitchen&rsquo;s price for the food. TiffinGo takes a commission from the kitchen, not a fee from you.</p>
      </Section>

      <Section heading="Changing or cancelling">
        <p>You can pause or cancel a weekly plan any time from the Plan tab. Changes take effect from the following week; a week already confirmed and charged is already being cooked.</p>
        <p>If something arrives wrong, late, or not at all, tell us within 48 hours at tiffingo.app@gmail.com and we will make it right with the kitchen.</p>
      </Section>

      <Section heading="Food, allergies and safety">
        <p>
          Kitchens are independent businesses responsible for their own food safety, licensing and
          ingredient accuracy. Calorie and protein figures shown in the app are estimates for guidance,
          not verified nutritional analysis, and must not be relied on for medical or dietary decisions.
        </p>
        <p>
          <strong>If you have a food allergy, contact the kitchen directly before ordering.</strong> We
          cannot guarantee any dish is free of any allergen, and shared kitchens carry cross-contamination risk.
        </p>
      </Section>

      <Section heading="If you run a kitchen">
        <p>You keep ownership of your menu and brand. You are responsible for holding the licences and food-safety certification your municipality requires, for cooking what you listed, and for the accuracy of your prices and descriptions. TiffinGo&rsquo;s commission is shown on your dashboard; payouts settle to the account you connect through Stripe.</p>
        <p>We may remove a listing that receives repeated safety complaints or that misrepresents what it sells.</p>
      </Section>

      <Section heading="Acceptable use">
        <p>Do not use TiffinGo to break the law, to harass kitchens or drivers, to scrape or resell our content, or to interfere with the service. We can suspend accounts that do.</p>
      </Section>

      <Section heading="Our liability">
        <p>
          We provide the service as it is. We are not liable for the quality, safety or legality of food
          prepared by an independent kitchen. Where liability cannot be excluded by law, ours is limited
          to the amount you paid through TiffinGo in the three months before the claim.
        </p>
        <p>Nothing here limits rights you have under British Columbia consumer protection law.</p>
      </Section>

      <Section heading="Ending the agreement">
        <p>You can delete your account at any time from Profile → Delete my account. We can close an account that breaches these terms, and will tell you why unless the law prevents it.</p>
      </Section>

      <Section heading="Governing law">
        <p>These terms are governed by the laws of British Columbia and the federal laws of Canada that apply there.</p>
      </Section>

      <Section heading="Contact">
        <p>Jungle Labs Inc., Surrey, British Columbia — tiffingo.app@gmail.com</p>
      </Section>
    </LegalShell>
  );
}

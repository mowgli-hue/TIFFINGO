import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TiffinGo — Homemade food. Delivered.',
  description: 'Order fresh homemade meals from local kitchens in Surrey & Vancouver.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A2E1A',
              color: '#F5F2E8',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#E8A020', secondary: '#1A2E1A' } },
          }}
        />
      </body>
    </html>
  );
}

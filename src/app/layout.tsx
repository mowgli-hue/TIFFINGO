import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TiffinGo — Homemade food. Delivered.',
  description: 'Subscribe to home-cooked tiffin meals from local kitchens. Delivered fresh, daily.',
  keywords: ['tiffin delivery', 'home cooked meals', 'food delivery Vancouver', 'Indian food delivery'],
  openGraph: {
    title: 'TiffinGo',
    description: 'Homemade food. Delivered.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2C2C2A',
              color: '#FAFAF8',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}

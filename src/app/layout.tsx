import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TiffinGo — Homemade food. Delivered.',
  description: 'Fresh homemade meals from local kitchens. Daily delivery in Surrey & Vancouver.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A3A2A',
              color: '#F5F5F0',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#F0B429', secondary: '#1A3A2A' } },
          }}
        />
      </body>
    </html>
  );
}

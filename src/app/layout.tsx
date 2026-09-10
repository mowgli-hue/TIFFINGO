import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import NativeShell from '@/components/NativeShell';
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
  applicationName: 'TiffinGo',
  appleWebApp: { capable: true, title: 'TiffinGo', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

/* viewport-fit=cover lets the app paint under the notch and the home
   indicator; the safe-area insets in globals.css keep content clear of them. */
export const viewport: Viewport = {
  themeColor: '#043F28',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        {children}
        <NativeShell />
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

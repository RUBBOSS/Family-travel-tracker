import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Family Travel Tracker',
  description:
    'Track countries visited by your family on an interactive world map. Plan, explore, and share your journeys together.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100" suppressHydrationWarning>
        <UserProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                backdropFilter: 'blur(8px)',
              },
              success: {
                iconTheme: { primary: '#2dd4bf', secondary: '#0f172a' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#0f172a' },
              },
            }}
          />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

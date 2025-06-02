import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';
import { SchemaInitializer } from '@/components/SchemaInitializer';
import '@/utils/clearAuth'; // Import to make clearAuth available globally
import '@/utils/testDatabase'; // Import to make testDatabase available globally
// Using unified schema now - no need to import separate check

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Family Travel Tracker',
  description: 'Track countries visited by family members on an interactive world map',
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
}) {  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" suppressHydrationWarning>
        <SchemaInitializer />
        <UserProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#0d9488',
                },
              },
              error: {
                style: {
                  background: '#b91c1c',
                },
              },
            }}
          />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

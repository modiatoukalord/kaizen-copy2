
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { CurrencyProvider } from '@/contexts/currency-context';
import MobileNav from '@/components/dashboard/mobile-nav';

export const metadata: Metadata = {
  title: 'Le KAIZEN',
  description: 'A personal finance dashboard to track income and expenses.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#E8EAF6" />
      </head>
      <body className="font-body antialiased">
        <CurrencyProvider>
          <div className="flex min-h-screen w-full flex-col">
              <DashboardHeader />
              <main className="flex-1 pb-24 md:pb-8">
                  {children}
              </main>
          </div>
          <MobileNav />
          <Toaster />
        </CurrencyProvider>
      </body>
    </html>
  );
}

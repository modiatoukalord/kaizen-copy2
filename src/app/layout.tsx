import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { CurrencyProvider } from '@/contexts/currency-context';

export const metadata: Metadata = {
  title: 'Financial Compass',
  description: 'A personal finance dashboard to track income and expenses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <CurrencyProvider>
          <div className="flex min-h-screen w-full flex-col">
              <DashboardHeader />
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                  {children}
              </main>
          </div>
          <Toaster />
        </CurrencyProvider>
      </body>
    </html>
  );
}

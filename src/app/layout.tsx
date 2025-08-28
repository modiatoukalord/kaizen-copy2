
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CurrencyProvider } from '@/contexts/currency-context';
import { AuthProvider } from '@/contexts/auth-context';
import AppContent from './app-content';


export const metadata: Metadata = {
  title: 'Le KAIZEN',
  description: 'A personal finance dashboard to track income and expenses.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/images/icons/logo.png',
    apple: '/images/icons/logo.png',
  },
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
       <head>
        <meta name="theme-color" content="#E8EAF6" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
            <CurrencyProvider>
                <AppContent>{children}</AppContent>
                <Toaster />
            </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

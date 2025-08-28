
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import Image from 'next/image';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import MobileNav from '@/components/dashboard/mobile-nav';
import ChatAssistant from '@/components/assistant/chat-assistant';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useAuth();
  
  const publicRoutes = ['/login', '/'];

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, pathname, router, publicRoutes]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Image src="/images/icons/logo.png" alt="Chargement..." width={48} height={48} className="h-12 w-12 animate-pulse" />
      </div>
    );
  }

  // This prevents a flash of the login page if the user is already authenticated
  // and navigating to a protected route.
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <Image src="/images/icons/logo.png" alt="Chargement..." width={48} height={48} className="h-12 w-12 animate-pulse" />
      </div>
    );
  }
  
  const isAppRoute = isAuthenticated && !publicRoutes.includes(pathname);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {isAppRoute && <DashboardHeader />}
      <main className={isAppRoute ? "flex-1 pb-24 md:pb-8" : "flex-1"}>
        {children}
      </main>
      {isAppRoute && (
        <>
          <ChatAssistant />
          <MobileNav />
        </>
      )}
    </div>
  );
}

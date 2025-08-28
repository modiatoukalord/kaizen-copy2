
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Extend the Window interface to include the onbeforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    // We've used the prompt, and can't use it again, so clear it.
    if (outcome === 'accepted') {
        setInstallPrompt(null);
    }
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleInstallClick}
      title="Installer l'application"
    >
      <Image src="/images/icons/logo.png" alt="Installer l'application" width={24} height={24} className="h-6 w-6" />
      <span className="sr-only">Installer l'application</span>
    </Button>
  );
};

export default InstallPWA;


'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { PiggyBank } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const onboardingSteps = [
  {
    image: '/images/onboarding/step1.png',
    title: 'Suivez vos finances',
    description: 'Gardez un œil sur vos revenus et dépenses en un seul endroit.',
  },
  {
    image: '/images/onboarding/step2.png',
    title: 'Planifiez votre budget',
    description: 'Définissez des budgets mensuels et atteignez vos objectifs financiers.',
  },
  {
    image: '/images/onboarding/step3.png',
    title: 'Visualisez vos données',
    description: 'Des graphiques clairs pour mieux comprendre vos habitudes de dépenses.',
  },
];

export default function OnboardingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading) {
        const hasOnboarded = localStorage.getItem('hasOnboarded');
        if (hasOnboarded === 'true' || isAuthenticated) {
          router.replace('/dashboard');
        } else {
          setIsLoading(false);
        }
    }
  }, [router, isAuthLoading, isAuthenticated]);


  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleNext = () => {
    if (current === onboardingSteps.length - 1) {
      localStorage.setItem('hasOnboarded', 'true');
      router.push('/login');
    } else {
      api?.scrollNext();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasOnboarded', 'true');
    router.push('/login');
  };
  
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <PiggyBank className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6">
      <Carousel setApi={setApi} className="w-full max-w-md">
        <CarouselContent>
          {onboardingSteps.map((step, index) => (
            <CarouselItem key={index}>
              <Card className="border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={300}
                    height={300}
                    className="mb-8 aspect-square"
                  />
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-8 flex items-center justify-center gap-2">
        {onboardingSteps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              current === i ? 'w-4 bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="mt-auto flex w-full max-w-md flex-col gap-2">
        <Button onClick={handleNext} size="lg">
          {current === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>
        <Button variant="ghost" onClick={handleSkip} size="lg">
          Passer
        </Button>
      </div>
    </div>
  );
}

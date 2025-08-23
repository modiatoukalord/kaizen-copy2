
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PiggyBank, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('finance-app-user');
    if (storedUser) {
      setIsRegistering(false);
    } else {
      setIsRegistering(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (pin.length !== 4) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le code PIN doit contenir 4 chiffres.' });
      return;
    }

    setIsLoading(true);
    // Simulate async operation
    setTimeout(() => {
        try {
            login(username, pin);
            toast({ title: 'Succès', description: isRegistering ? 'Compte créé avec succès !' : 'Connexion réussie !' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur de connexion', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, 500);

  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <PiggyBank className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PiggyBank className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">{isRegistering ? 'Créer un compte' : 'Connexion'}</CardTitle>
          <CardDescription>
            {isRegistering
              ? 'Choisissez un nom d\'utilisateur et un code PIN à 4 chiffres.'
              : 'Entrez vos identifiants pour accéder à votre tableau de bord.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Code PIN (4 chiffres)</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? 'Enregistrer' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import SubNavigation from '@/components/dashboard/sub-navigation';

export default function SettingsPage() {
  const { user, changePin, changeUsername, changeProfilePicture } = useAuth();
  
  // State for changing PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);

  // State for changing username
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [currentPinForUsername, setCurrentPinForUsername] = useState('');
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);

  // State for changing profile picture
  const [newProfilePictureUrl, setNewProfilePictureUrl] = useState(user?.profilePictureUrl || '');
  const [isPictureLoading, setIsPictureLoading] = useState(false);


  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPin || !newPin || !confirmPin) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Les nouveaux codes PIN ne correspondent pas.' });
      return;
    }
    if (newPin.length !== 4) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le nouveau code PIN doit contenir 4 chiffres.' });
      return;
    }

    setIsPinLoading(true);
    try {
        if (user) {
            await changePin(oldPin, newPin);
            toast({ title: 'Succès', description: 'Votre code PIN a été modifié.' });
            setOldPin('');
            setNewPin('');
            setConfirmPin('');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
        setIsPinLoading(false);
    }
  };
  
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !currentPinForUsername) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
      return;
    }
     if (newUsername === user?.username) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le nouveau nom d'utilisateur est identique à l'ancien." });
      return;
    }

    setIsUsernameLoading(true);
    try {
        if (user) {
            await changeUsername(newUsername, currentPinForUsername);
            toast({ title: 'Succès', description: 'Votre nom d\'utilisateur a été modifié.' });
            setCurrentPinForUsername('');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
        setIsUsernameLoading(false);
    }
  };
  
  const handlePictureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfilePictureUrl) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez fournir une URL pour l\'image.' });
      return;
    }
    
    setIsPictureLoading(true);
    try {
        await changeProfilePicture(newProfilePictureUrl);
        toast({ title: 'Succès', description: 'Votre photo de profil a été mise à jour.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
        setIsPictureLoading(false);
    }
  };


  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <SubNavigation />
       <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les informations de votre compte.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Changer le nom d'utilisateur</CardTitle>
                    <CardDescription>Mettez à jour votre nom d'utilisateur.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleUsernameSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUsername">Nouveau nom d'utilisateur</Label>
                            <Input
                                id="newUsername"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentPinForUsername">Code PIN actuel (pour confirmation)</Label>
                            <Input
                                id="currentPinForUsername"
                                type="password"
                                value={currentPinForUsername}
                                onChange={(e) => setCurrentPinForUsername(e.target.value)}
                                maxLength={4}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isUsernameLoading}>
                            {isUsernameLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Changer le nom d'utilisateur
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Changer le code PIN</CardTitle>
                    <CardDescription>Mettez à jour votre code PIN à 4 chiffres.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="oldPin">Ancien code PIN</Label>
                            <Input
                            id="oldPin"
                            type="password"
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value)}
                            maxLength={4}
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPin">Nouveau code PIN</Label>
                            <Input
                            id="newPin"
                            type="password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            maxLength={4}
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPin">Confirmer le nouveau code PIN</Label>
                            <Input
                            id="confirmPin"
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            maxLength={4}
                            required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPinLoading}>
                            {isPinLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Changer le code PIN
                        </Button>
                    </form>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Changer la photo de profil</CardTitle>
                    <CardDescription>Mettez à jour votre photo de profil en utilisant une URL d'image.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handlePictureSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newProfilePictureUrl">URL de l'image de profil</Label>
                            <Input
                                id="newProfilePictureUrl"
                                type="url"
                                value={newProfilePictureUrl}
                                onChange={(e) => setNewProfilePictureUrl(e.target.value)}
                                placeholder="https://example.com/image.png"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPictureLoading}>
                            {isPictureLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mettre à jour la photo
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

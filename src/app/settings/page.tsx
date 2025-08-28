
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import SubNavigation from '@/components/dashboard/sub-navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function SettingsPage() {
  const { user, changePin, changeUsername, uploadAndChangeProfilePicture } = useAuth();
  
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
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(user?.profilePictureUrl || null);
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
  
  const handlePictureChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez sélectionner un fichier image.' });
        return;
    }

    try {
        const compressedFile = await compressImage(file);
        setPictureFile(compressedFile);
        setPicturePreview(URL.createObjectURL(compressedFile));
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur de compression', description: error.message });
    }
  }, []);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Impossible d\'obtenir le contexte du canvas.'));

                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const MAX_SIZE_MB = 1;
                
                const processBlob = (blob: Blob | null) => {
                    if (blob) {
                        if (blob.size / 1024 / 1024 > MAX_SIZE_MB && quality > 0.1) {
                            quality -= 0.1;
                            canvas.toBlob(processBlob, 'image/jpeg', quality);
                        } else {
                            const resizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(resizedFile);
                        }
                    } else {
                        reject(new Error('Impossible de créer le blob de l\'image.'));
                    }
                };

                canvas.toBlob(processBlob, 'image/jpeg', quality);
            };
            img.onerror = () => reject(new Error('Impossible de charger l\'image.'));
        };
        reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    });
  };

  const handlePictureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pictureFile) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez sélectionner un fichier image.' });
      return;
    }
    
    setIsPictureLoading(true);
    try {
        await uploadAndChangeProfilePicture(pictureFile);
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
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Changer la photo de profil</CardTitle>
                    <CardDescription>Mettez à jour votre photo de profil (max 1Mo).</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handlePictureSubmit} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={picturePreview || undefined} alt={user?.username} />
                                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="newProfilePicture">Choisir une image</Label>
                                <Input
                                    id="newProfilePicture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isPictureLoading || !pictureFile}>
                            {isPictureLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mettre à jour la photo
                        </Button>
                    </form>
                </CardContent>
            </Card>
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
        </div>
      </div>
    </div>
  );
}

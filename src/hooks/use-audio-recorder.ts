
'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from './use-toast';

interface UseAudioRecorderProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob, mimeType: string) => void;
}

export const useAudioRecorder = ({ onRecordingComplete }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Laisse le navigateur choisir le meilleur mimeType supporté (souvent audio/webm ou audio/ogg)
      // pour garantir la compatibilité et la qualité.
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Récupère le mimeType réellement utilisé par le navigateur.
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordingComplete(audioUrl, audioBlob, mimeType);
        // Nettoie les pistes du stream.
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          variant: 'destructive',
          title: 'Erreur d\'enregistrement',
          description: 'Une erreur est survenue lors de l\'enregistrement audio.',
        });
        setIsRecording(false);
      }

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
        console.error('Error accessing microphone:', err);
        let title = 'Accès au microphone refusé';
        let description = 'Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.';
        if (err instanceof DOMException) {
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                title = 'Microphone non trouvé';
                description = 'Aucun microphone n\'a été détecté. Veuillez vérifier que votre appareil est bien connecté.';
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                 title = 'Permission refusée';
                 description = 'Vous avez refusé l\'accès au microphone. Veuillez l\'autoriser dans les paramètres de votre navigateur.';
            }
        }
       toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording };
};

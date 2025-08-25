
'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from './use-toast';

interface UseAudioRecorderProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob, mimeType: string) => void;
}

const mimeType = 'audio/wav';

export const useAudioRecorder = ({ onRecordingComplete }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordingComplete(audioUrl, audioBlob, mimeType);
        // Clean up the stream tracks
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
       toast({
        variant: 'destructive',
        title: 'Accès au microphone refusé',
        description: 'Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.',
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

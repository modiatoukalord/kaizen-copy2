
'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from './use-toast';

interface UseAudioRecorderProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob, mimeType: string) => void;
}

// Helper function to convert a Blob to a WAV Blob
const toWav = async (blob: Blob): Promise<{ wavBlob: Blob, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const fileReader = new FileReader();

        fileReader.onloadend = async () => {
            try {
                const arrayBuffer = fileReader.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                // Encode AudioBuffer to WAV
                const wavBuffer = encodeWAV(audioBuffer);
                const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                resolve({ wavBlob, mimeType: 'audio/wav' });

            } catch (error) {
                console.error("Error decoding or encoding audio data:", error);
                reject(new Error("Impossible de convertir le fichier en WAV. Le format audio n'est peut-être pas pris en charge."));
            }
        };
        
        fileReader.onerror = () => {
            reject(new Error('Erreur lors de la lecture du fichier audio.'));
        };

        fileReader.readAsArrayBuffer(blob);
    });
};

// Function to encode an AudioBuffer to a WAV file (in a Buffer)
const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for (i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++;                                     // next source sample
    }
    
    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    return buffer;
};


export const useAudioRecorder = ({ onRecordingComplete }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const originalMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: originalMimeType });
        
        try {
            // Convert to WAV before calling the completion handler
            const { wavBlob, mimeType } = await toWav(audioBlob);
            const audioUrl = URL.createObjectURL(wavBlob);
            onRecordingComplete(audioUrl, wavBlob, mimeType);

        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Erreur de conversion audio',
                description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
            });
        }
        
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

import { useState, useRef, useCallback } from 'react';

export const useVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorder.current && isRecording) {
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          setIsRecording(false);
          resolve(audioBlob);
        };
        mediaRecorder.current.stop();
      }
    });
  }, [isRecording]);

  const speechToText = useCallback(async (audioBlob: Blob): Promise<string> => {
    // Simple placeholder - in production you'd use Web Speech API or a service
    return new Promise((resolve) => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };
        
        recognition.onerror = () => {
          resolve("Could not transcribe audio. Please try typing your answer instead.");
        };
        
        // For demo purposes, return a placeholder
        setTimeout(() => {
          resolve("Voice transcription would appear here in a full implementation with proper speech-to-text service.");
        }, 1000);
      } else {
        resolve("Speech recognition not supported in this browser.");
      }
    });
  }, []);

  const textToSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    speechToText,
    textToSpeech,
    stopSpeech
  };
};

// Add global types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
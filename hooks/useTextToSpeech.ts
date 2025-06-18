import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface TextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = (text: string, customOptions?: TextToSpeechOptions) => {
    if (!isSupported || !text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    const finalOptions = { ...options, ...customOptions };
    if (finalOptions.rate) utterance.rate = finalOptions.rate;
    if (finalOptions.pitch) utterance.pitch = finalOptions.pitch;
    if (finalOptions.volume) utterance.volume = finalOptions.volume;
    
    // Find and set voice
    if (finalOptions.voice) {
      const selectedVoice = voices.find(voice => 
        voice.name === finalOptions.voice || voice.lang === finalOptions.voice
      );
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported) {
      speechSynthesis.resume();
    }
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
  };
}
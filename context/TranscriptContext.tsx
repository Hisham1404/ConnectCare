// ./context/TranscriptContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface TranscriptContextType {
  transcript: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearTranscript: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const TranscriptProvider = ({ children }: { children: ReactNode }) => {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, newMessage]);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  return (
    <TranscriptContext.Provider value={{ 
      transcript, 
      addMessage, 
      clearTranscript, 
      isRecording, 
      setIsRecording 
    }}>
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (context === undefined) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
};
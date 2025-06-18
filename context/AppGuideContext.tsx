import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppGuideContextType {
  isGuideVisible: boolean;
  isMinimized: boolean;
  isListening: boolean;
  toggleGuide: () => void;
  minimizeGuide: () => void;
  expandGuide: () => void;
  closeGuide: () => void;
  setIsListening: (listening: boolean) => void;
}

const AppGuideContext = createContext<AppGuideContextType | undefined>(undefined);

interface AppGuideProviderProps {
  children: ReactNode;
}

export const AppGuideProvider: React.FC<AppGuideProviderProps> = ({ children }) => {
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleGuide = () => {
    if (isGuideVisible) {
      // If visible, close it completely
      setIsGuideVisible(false);
      setIsMinimized(false);
      setIsListening(false);
    } else {
      // If not visible, open it expanded
      setIsGuideVisible(true);
      setIsMinimized(false);
    }
  };

  const minimizeGuide = () => {
    setIsMinimized(true);
    // Keep isGuideVisible true so conversation stays active
  };

  const expandGuide = () => {
    setIsMinimized(false);
    setIsGuideVisible(true);
  };

  const closeGuide = () => {
    setIsGuideVisible(false);
    setIsMinimized(false);
    setIsListening(false);
  };

  const value = {
    isGuideVisible,
    isMinimized,
    isListening,
    toggleGuide,
    minimizeGuide,
    expandGuide,
    closeGuide,
    setIsListening,
  };

  return (
    <AppGuideContext.Provider value={value}>
      {children}
    </AppGuideContext.Provider>
  );
};

export const useAppGuide = (): AppGuideContextType => {
  const context = useContext(AppGuideContext);
  if (context === undefined) {
    throw new Error('useAppGuide must be used within an AppGuideProvider');
  }
  return context;
};
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { GlobalContextType, ToastType } from '@/types';

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalContextProviderProps {
  children: ReactNode;
}

export const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
  const [showCustomToast, setShowCustomToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('SUCCESS');
  const [toastText, setToastText] = useState('');

  const hideToast = () => {
    setShowCustomToast(false);
  };

  const updateCustomToast = (_toastType: ToastType, _toastText: string) => {
    setShowCustomToast(true);
    setToastType(_toastType);
    setToastText(_toastText);
  };

  return (
    <GlobalContext.Provider
      value={{
        updateCustomToast,
        showCustomToast,
        toastType,
        toastText,
        hideToast,
        setShowCustomToast,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  return context;
};

'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { GlobalContextProvider } from './GlobalContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <GlobalContextProvider>
        {children}
      </GlobalContextProvider>
    </AuthProvider>
  );
}

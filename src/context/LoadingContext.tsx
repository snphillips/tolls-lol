// LoadingContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  loadingBoolean: boolean;
  loadingMessage: string;
  setLoading: (loadingBoolean: boolean, loadingMessage?: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingBoolean, setLoadingState] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const setLoading = (loading: boolean, loadingMessage: string = '') => {
    setLoadingState(loading);
    setLoadingMessage(loadingMessage);
  };

  return (
    <LoadingContext.Provider value={{ loadingBoolean, loadingMessage, setLoading }}>{children}</LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// LoadingContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  loadingBoolean: boolean;
  setLoading: (loadingBoolean: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingBoolean, setLoadingBoolean] = useState<boolean>(false);

  const setLoading = (loading: boolean) => {
    setLoadingBoolean(loading);
  };

  return <LoadingContext.Provider value={{ loadingBoolean, setLoading }}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

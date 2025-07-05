'use client';

import { createContext, useContext, ReactNode, useState, useMemo } from 'react';

type BreadcrumbContextType = {
  pageTitle: string;
  setPageTitle: (title: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [pageTitle, setPageTitle] = useState('');

  const value = useMemo(() => ({ pageTitle, setPageTitle }), [pageTitle, setPageTitle]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
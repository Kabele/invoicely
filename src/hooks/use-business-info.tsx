'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { BusinessInfo } from '@/lib/types';

interface BusinessInfoContextType {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
  isLoaded: boolean;
}

const defaultBusinessInfo: BusinessInfo = {
    businessName: '',
    address: '',
    accountNumber: '',
    socials: '',
    email: '',
    website: '',
};

const BusinessInfoContext = createContext<BusinessInfoContextType>({
  businessInfo: defaultBusinessInfo,
  setBusinessInfo: () => {},
  isLoaded: false,
});

export function BusinessInfoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(defaultBusinessInfo);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStorageKey = useCallback(() => {
    return user ? `businessInfo_${user.uid}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        setIsLoaded(true);
        setBusinessInfoState(defaultBusinessInfo); // Reset on logout
        return;
    }
    try {
      const storedInfo = localStorage.getItem(storageKey);
      if (storedInfo) {
        setBusinessInfoState(JSON.parse(storedInfo));
      } else {
        setBusinessInfoState(defaultBusinessInfo); // Set default if nothing is stored
      }
    } catch (error) {
      console.error('Failed to load business info from local storage:', error);
    } finally {
        setIsLoaded(true);
    }
  }, [getStorageKey]);

  const setBusinessInfo = (newInfo: BusinessInfo) => {
    const storageKey = getStorageKey();
    if(storageKey){
        try {
            localStorage.setItem(storageKey, JSON.stringify(newInfo));
            setBusinessInfoState(newInfo);
        } catch (error) {
            console.error('Failed to save business info to local storage:', error);
        }
    }
  };

  const value = {
    businessInfo,
    setBusinessInfo,
    isLoaded,
  };

  return <BusinessInfoContext.Provider value={value}>{children}</BusinessInfoContext.Provider>;
}

export const useBusinessInfo = () => {
  const context = useContext(BusinessInfoContext);
  if (context === undefined) {
    throw new Error('useBusinessInfo must be used within a BusinessInfoProvider');
  }
  return context;
};

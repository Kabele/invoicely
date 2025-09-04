'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { BusinessInfo } from '@/lib/types';

interface BusinessInfoContextType {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: Partial<BusinessInfo>) => Promise<void>;
  isLoaded: boolean;
}

const defaultBusinessInfo: BusinessInfo = {
    businessName: '',
    address: '',
    accountName: '',
    accountNumber: '',
    socials: '',
    email: '',
    website: '',
    primaryColor: '#000000',
    accentColor: '#4f46e5',
};

const BusinessInfoContext = createContext<BusinessInfoContextType>({
  businessInfo: defaultBusinessInfo,
  setBusinessInfo: async () => {},
  isLoaded: false,
});

export function BusinessInfoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(defaultBusinessInfo);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setBusinessInfoState(defaultBusinessInfo);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessInfoState({ ...defaultBusinessInfo, ...data } as BusinessInfo);
      } else {
        const initialInfo = { ...defaultBusinessInfo, email: user.email || '' };
        setDoc(docRef, { email: user.email }, { merge: true });
        setBusinessInfoState(initialInfo);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("Failed to load business info from Firestore:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  const setBusinessInfo = useCallback(async (newInfo: Partial<BusinessInfo>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, newInfo, { merge: true });
    } catch (error) {
      console.error('Failed to save business info to Firestore:', error);
      throw error;
    }
  }, [user]);

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

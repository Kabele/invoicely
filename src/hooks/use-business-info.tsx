'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
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
    primaryColor: '#000000',
    accentColor: '#4f46e5',
    signatureImage: '',
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
        setBusinessInfoState({ ...defaultBusinessInfo, ...docSnap.data() } as BusinessInfo);
      } else {
        setBusinessInfoState(defaultBusinessInfo);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("Failed to load business info from Firestore:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  const setBusinessInfo = async (newInfo: BusinessInfo) => {
    if (user) {
      try {
        const completeInfo = { ...businessInfo, ...newInfo };
        await setDoc(doc(db, 'users', user.uid), completeInfo, { merge: true });
        // The state will be updated by the onSnapshot listener
      } catch (error) {
        console.error('Failed to save business info to Firestore:', error);
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

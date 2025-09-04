
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import type { BusinessInfo } from '@/lib/types';
import { saveBusinessInfo as saveBusinessInfoAction } from '@/lib/actions';

interface BusinessInfoContextType {
  businessInfo: BusinessInfo;
  isLoaded: boolean;
  saveBusinessInfo: (info: BusinessInfo) => Promise<{success: boolean, error?: string}>;
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
  isLoaded: false,
  saveBusinessInfo: async () => ({success: false, error: 'Not implemented'}),
});

export function BusinessInfoProvider({ children }: { children: React.ReactNode }) {
  const { user, getAuthToken } = useAuth();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setBusinessInfo(defaultBusinessInfo);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessInfo({ ...defaultBusinessInfo, ...data } as BusinessInfo);
      } else {
        // Doc doesn't exist, use default info with user's email
        setBusinessInfo({ ...defaultBusinessInfo, email: user.email || '' });
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("Failed to load business info from Firestore:", error);
      setBusinessInfo({ ...defaultBusinessInfo, email: user.email || '' });
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  const saveBusinessInfo = useCallback(async (info: BusinessInfo) => {
    const token = await getAuthToken();
    if (!token) {
        return { success: false, error: "Authentication token not found." };
    }
    
    // We need to wrap the server action call in a custom fetch to pass the auth token.
    // This is a workaround for Next.js server actions not having built-in auth context propagation yet.
    try {
        const response = await fetch('/api/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(info),
        });

        if (!response.ok) {
            const res = await response.json();
            throw new Error(res.error || 'Failed to save settings.');
        }

        return await response.json();

    } catch (error) {
        console.error(error);
        return { success: false, error: (error as Error).message };
    }
  }, [getAuthToken]);

  const value = {
    businessInfo,
    isLoaded,
    saveBusinessInfo,
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

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
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
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setBusinessInfo(defaultBusinessInfo);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const fetchBusinessInfo = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to load business info from Supabase:', error);
        setBusinessInfo({ ...defaultBusinessInfo, email: user.email || '' });
      } else {
        setBusinessInfo({ ...defaultBusinessInfo, ...data });
      }
      setIsLoaded(true);
    };

    fetchBusinessInfo();

    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.id}` }, fetchBusinessInfo)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const saveBusinessInfo = useCallback(async (info: BusinessInfo) => {
     try {
        return await saveBusinessInfoAction(info);
    } catch (error) {
        console.error(error);
        return { success: false, error: (error as Error).message };
    }
  }, []);

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

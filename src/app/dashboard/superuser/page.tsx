
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Firestore } from 'firebase/firestore';

const superuserEmail = 'kabelecliff@gmail.com';

interface Analytics {
  totalUsers: number;
  totalInvoices: number;
  totalReceipts: number;
}

export default function SuperuserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [db, setDb] = useState<Firestore | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    getDb().then(setDb);
  }, []);

  useEffect(() => {
    if (!authLoading && user?.email !== superuserEmail) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email === superuserEmail && db) {
      const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
          const { collectionGroup, getCountFromServer, query, where } = await import('firebase/firestore');
          
          const usersQuery = query(collectionGroup(db, 'users'), where('email', '!=', superuserEmail));
          const usersSnapshot = await getCountFromServer(usersQuery);
          
          const invoicesQuery = collectionGroup(db, 'invoices');
          const invoicesSnapshot = await getCountFromServer(invoicesQuery);

          const receiptsQuery = collectionGroup(db, 'receipts');
          const receiptsSnapshot = await getCountFromServer(receiptsQuery);

          setAnalytics({
            totalUsers: usersSnapshot.data().count,
            totalInvoices: invoicesSnapshot.data().count,
            totalReceipts: receiptsSnapshot.data().count,
          });
        } catch (error) {
          console.error("Error fetching analytics:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [user, db]);

  if (authLoading || isLoading) {
    return <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    </div>;
  }
  
  if (user?.email !== superuserEmail) {
    return null; // or a redirect component
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Superuser Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users (excluding admin)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalReceipts}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>More Analytics Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This is just the beginning. We'll be adding more detailed analytics and user management tools to this dashboard.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, getProfile } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      getProfile().then((result) => {
        if (result.meta.requestStatus === 'rejected') {
          router.push('/login');
        }
      });
    }
  }, [isAuthenticated, isLoading, router, getProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </div>
    </div>
  );
}
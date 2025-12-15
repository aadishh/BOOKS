'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '@/components/Home/HomePage';
import LoginHomePage from '@/components/Home/LoginHomePage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomToast from '@/components/CustomToast';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const isLoggedIn = !!token;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen">
        <LoginHomePage />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <CustomToast />
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  );
}

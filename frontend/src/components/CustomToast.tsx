'use client';

import { useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalContext';

export default function CustomToast() {
  const { showCustomToast, toastType, toastText, hideToast } = useGlobalContext();

  useEffect(() => {
    if (showCustomToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCustomToast, hideToast]);

  if (!showCustomToast) return null;

  const bgColor = {
    SUCCESS: 'bg-green-500',
    ERROR: 'bg-red-500',
    INFO: 'bg-blue-500',
  }[toastType];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
        <p>{toastText}</p>
      </div>
    </div>
  );
}

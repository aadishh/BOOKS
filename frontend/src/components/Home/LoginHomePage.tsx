'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function LoginHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to Bookstore</h1>
        <p className="text-xl mb-8">Your gateway to endless stories</p>
        <Link
          href={ROUTES.LOGIN}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

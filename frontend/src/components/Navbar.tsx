'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('data');
    router.push(ROUTES.LOGIN);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href={ROUTES.HOME} className="text-2xl font-bold text-gray-800">
            Bookstore
          </Link>
          
          <div className="flex gap-6 items-center">
            <Link href={ROUTES.HOME} className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href={ROUTES.BOOKS} className="text-gray-600 hover:text-gray-900">
              Books
            </Link>
            <Link href={ROUTES.CONTACT} className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href={ROUTES.PROFILE} className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <Link href={ROUTES.CART} className="text-gray-600 hover:text-gray-900">
              Cart
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/utils';
import CustomImage from '../miniComponents/CustomImage';
import { getDeviceType, myLocalLog } from '@/utils/helper';

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemsCount = cart?.cart?.length || 0;
  const wishlistItemsCount = wishlist?.wishlist?.length || 0;

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/books' },
    { name: 'BOOKS', href: '/categories' },
    { name: 'NEW RELEASE', href: '/new-release' },
    { name: 'CONTACT US', href: '/contact' },
    { name: 'BLOG', href: '/blog' },
  ];

  useEffect(() => {
    myLocalLog("", getDeviceType())
    if (getDeviceType() === "laptop") {
      // if (getDeviceType() === "laptop") {
      setShowMenu(false)
    }
    else {
      setShowMenu(true)
    }
  }, [])




  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Layout */}
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className='bg-gray-300 w-12 h-12 rounded-full flex items-center justify-center'>
                <CustomImage name='bookLogo' className="w-8 h-8" />
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden laptop:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors duration-200 py-2 px-1',
                  index === 0
                    ? 'text-flamingo font-semibold' // HOME is active/highlighted
                    : router.pathname === item.href
                      ? 'text-flamingo font-semibold'
                      : 'text-gray-700 hover:text-flamingo'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Action Icons - Desktop */}
            <div className="hidden laptop:flex items-center space-x-4">
              {/* User Icon */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 text-gray-600 hover:text-flamingo transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-flamingo transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-flamingo transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-flamingo transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-gray-200 mt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login">
                  <button className="p-2 text-gray-600 hover:text-flamingo transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </Link>
              )}

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-flamingo transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs bg-flamingo text-white"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-600 hover:text-flamingo transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistItemsCount > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs bg-flamingo text-white"
                  >
                    {wishlistItemsCount}
                  </Badge>
                )}
              </Link>
            </div>

            {/* Mobile/Tablet Menu Button */}
            {showMenu ?
              <button
                className="laptop:hidden p-2 text-gray-600 hover:text-flamingo transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              :
              <div className=''>

              </div>
            }

          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMenuOpen && (
          <div className="laptop:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-6 space-y-6">
              {/* Search Bar */}
              {/* <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flamingo focus:border-flamingo"
                  />
                </div>
              </form> */}

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      index === 0
                        ? 'text-flamingo bg-flamingo/5' // HOME is active
                        : router.pathname === item.href
                          ? 'text-flamingo bg-flamingo/5'
                          : 'text-gray-700 hover:text-flamingo hover:bg-gray-50'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Actions */}
              {isAuthenticated ? (
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/wishlist"
                      className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-flamingo hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                      {wishlistItemsCount > 0 && (
                        <Badge size="sm" className="ml-2 bg-flamingo text-white">
                          {wishlistItemsCount}
                        </Badge>
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-flamingo hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                      {cartItemsCount > 0 && (
                        <Badge size="sm" className="ml-2 bg-flamingo text-white">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </Link>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-flamingo hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile ({user?.username})
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-flamingo"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-flamingo hover:bg-flamingo/90 text-white border-0"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
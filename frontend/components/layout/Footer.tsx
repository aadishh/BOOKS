import React from 'react';
import Link from 'next/link';
import CustomImage from '../miniComponents/CustomImage';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refunds' },
    ],
    categories: [
      { name: 'Fiction', href: '/books?category=Fiction' },
      { name: 'Non-Fiction', href: '/books?category=Non-Fiction' },
      { name: 'Science', href: '/books?category=Science' },
      { name: 'Technology', href: '/books?category=Technology' },
    ],
  };

  return (
    <footer className='bg-flamingo text-white font-semibold'>
      <div className='container mx-auto px-6 py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          {/* Brand Section */}
          <section className='space-y-4'>
            <CustomImage name='bookLogo' className='h-12 w-auto' />
            <p className='font-normal text-sm leading-relaxed'>
              For those who live a thousand lives through books.
            </p>
            <div className='flex space-x-4'>
              <Link href='#' className='hover:opacity-80 transition-opacity'>
                <CustomImage name='whiteFacebook' className='h-6 w-6' />
              </Link>
              <Link href='#' className='hover:opacity-80 transition-opacity'>
                <CustomImage name='whiteLinkdin' className='h-6 w-6' />
              </Link>
              <Link href='#' className='hover:opacity-80 transition-opacity'>
                <CustomImage name='whiteTwitter' className='h-6 w-6' />
              </Link>
              <Link href='#' className='hover:opacity-80 transition-opacity'>
                <CustomImage name='whiteYoutube' className='h-6 w-6' />
              </Link>
            </div>
          </section>

          {/* Company Links */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Company</h3>
            <ul className='space-y-2'>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='font-normal text-sm hover:text-gray-200 transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Book Categories */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Categories</h3>
            <ul className='space-y-2'>
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='font-normal text-sm hover:text-gray-200 transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Legal Links */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Legal</h3>
            <ul className='space-y-2'>
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='font-normal text-sm hover:text-gray-200 transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Bottom Footer */}
        <div className='border-t border-white/20 pt-6'>
          <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
            <span className='text-sm font-normal'>
              © {currentYear} Arihant. All Rights Reserved.
            </span>
            <div className='flex space-x-6'>
              <Link href='/privacy' className='text-sm font-normal hover:text-gray-200 transition-colors'>
                Privacy
              </Link>
              <Link href='/terms' className='text-sm font-normal hover:text-gray-200 transition-colors'>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
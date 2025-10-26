import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  BookOpen,
  Star,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  ShoppingCart,
  Heart,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Badge, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { booksApi } from '@/lib/books-api';
import { Book } from '@/types';
import { formatCurrency } from '@/utils';

const HomePage: React.FC = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await booksApi.getBooks({ limit: 8, sortBy: 'rating', sortOrder: 'desc' });
        setFeaturedBooks(response.books);
      } catch (error) {
        console.error('Failed to fetch featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = async (book: Book) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await addToCart({
        bookId: book.id,
        name: book.name,
        price: book.discountPrice || book.price,
        quantity: 1,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToWishlist = async (book: Book) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await addToWishlist({
        bookId: book.id,
        name: book.name,
        price: book.discountPrice || book.price,
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const stats = [
    { icon: BookOpen, label: 'Books Available', value: '50,000+' },
    { icon: Users, label: 'Happy Customers', value: '25,000+' },
    { icon: Award, label: 'Awards Won', value: '15+' },
    { icon: TrendingUp, label: 'Years of Service', value: '10+' },
  ];

  const categories = [
    { name: 'Fiction', count: '12,000+', color: 'bg-primary' },
    { name: 'Non-Fiction', count: '8,500+', color: 'bg-secondary' },
    { name: 'Science', count: '6,200+', color: 'bg-primary/80' },
    { name: 'Technology', count: '4,800+', color: 'bg-secondary/80' },
    { name: 'History', count: '3,900+', color: 'bg-primary/60' },
    { name: 'Biography', count: '2,700+', color: 'bg-secondary/60' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Your Next
              <span className="block text-primary">Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-light max-w-3xl mx-auto animate-slide-up">
              Explore our vast collection of books across all genres. From bestsellers to hidden gems, 
              find the perfect book for every mood and moment.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-bounce-in">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for books, authors, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 focus:outline-none focus:ring-4 focus:ring-primary text-secondary shadow-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/books">
                <Button size="lg" className="bg-white text-primary hover:bg-light">
                  Browse All Books
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/auth/signup">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                    Join Now - It's Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-light rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Discover books across various genres and subjects
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/books?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className={`w-12 h-12 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted">{category.count}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Featured Books
              </h2>
              <p className="text-xl text-muted">
                Handpicked selections from our collection
              </p>
            </div>
            <Link href="/books">
              <Button variant="outline">
                View All Books
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="skeleton h-48 mb-4"></div>
                  <div className="skeleton h-4 mb-2"></div>
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-lg transition-all duration-200">
                  <div className="relative">
                    <div className="aspect-[3/4] bg-light rounded-t-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted" />
                    </div>
                    {book.discountPrice && (
                      <Badge
                        variant="danger"
                        className="absolute top-2 right-2"
                      >
                        {Math.round(((book.price - book.discountPrice) / book.price) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary mb-1 truncate-2">
                      {book.name}
                    </h3>
                    <p className="text-sm text-muted mb-2">
                      by {book.author}
                    </p>
                    
                    {book.rating && (
                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-primary fill-current" />
                        <span className="text-sm text-muted ml-1">
                          {book.rating} ({book.reviews || 0})
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {book.discountPrice ? (
                          <>
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(book.discountPrice)}
                            </span>
                            <span className="text-sm text-light0 line-through">
                              {formatCurrency(book.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(book.price)}
                          </span>
                        )}
                      </div>
                      <Badge variant={book.stock > 0 ? 'success' : 'danger'} size="sm">
                        {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={book.stock === 0}
                        onClick={() => handleAddToCart(book)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToWishlist(book)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Reading?
          </h2>
          <p className="text-xl mb-8 text-light">
            Join thousands of book lovers who trust us for their reading journey.
            Get started today and discover your next favorite book.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/books">
              <Button size="lg" className="bg-white text-primary hover:bg-light">
                Start Shopping
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Search,
    Filter,
    Grid,
    List,
    ChevronDown,
    Star,
    ShoppingCart,
    Heart,
    BookOpen,
    X,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Badge, LoadingSpinner, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { booksApi } from '@/lib/books-api';
import { Book, BookSearchParams, BooksResponse } from '@/types';
import { formatCurrency, debounce } from '@/utils';

const BooksPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
    });

    const [filters, setFilters] = useState({
        category: '',
        minPrice: undefined as number | undefined,
        maxPrice: undefined as number | undefined,
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
        inStock: false,
    });

    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const router = useRouter();

    // Categories for filter
    const categories = [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Romance',
        'Mystery',
        'Fantasy',
        'Self-Help',
    ];

    const sortOptions = [
        { value: 'name', label: 'Name' },
        { value: 'price', label: 'Price' },
        { value: 'rating', label: 'Rating' },
        { value: 'createdAt', label: 'Newest' },
    ];

    // Debounced search function
    const debouncedSearch = debounce((query: string) => {
        fetchBooks({ ...filters, q: query, page: 1 });
    }, 500);

    const fetchBooks = async (params: Partial<BookSearchParams> = {}) => {
        try {
            setLoading(true);
            const searchParams: BookSearchParams = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                ...filters,
                ...params,
            };

            // Remove empty values
            Object.keys(searchParams).forEach(key => {
                const value = searchParams[key as keyof BookSearchParams];
                if (value === '' || value === null || value === undefined) {
                    delete searchParams[key as keyof BookSearchParams];
                }
            });

            const response: BooksResponse = await booksApi.getBooks(searchParams);
            setBooks(response.books);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Initialize from URL params
    useEffect(() => {
        const { q, category, page, sortBy, sortOrder } = router.query;

        const initialFilters = {
            category: (category as string) || '',
            minPrice: undefined as number | undefined,
            maxPrice: undefined as number | undefined,
            sortBy: (sortBy as string) || 'name',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
            inStock: false,
        };

        const initialPage = parseInt(page as string) || 1;
        const initialQuery = (q as string) || '';

        setFilters(initialFilters);
        setSearchQuery(initialQuery);
        setPagination(prev => ({ ...prev, currentPage: initialPage }));

        fetchBooks({
            ...initialFilters,
            q: initialQuery,
            page: initialPage,
        });
    }, [router.isReady]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleFilterChange = (key: string, value: any) => {
        let processedValue = value;

        // Convert price strings to numbers
        if (key === 'minPrice' || key === 'maxPrice') {
            processedValue = value === '' ? undefined : parseFloat(value);
        }

        const newFilters = { ...filters, [key]: processedValue };
        setFilters(newFilters);
        fetchBooks({ ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
        fetchBooks({ page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        const clearedFilters = {
            category: '',
            minPrice: undefined as number | undefined,
            maxPrice: undefined as number | undefined,
            sortBy: 'name',
            sortOrder: 'asc' as 'asc' | 'desc',
            inStock: false,
        };
        setFilters(clearedFilters);
        setSearchQuery('');
        fetchBooks({ ...clearedFilters, q: '', page: 1 });
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

    const BookCard: React.FC<{ book: Book }> = ({ book }) => (
        <Card className="group hover:shadow-lg transition-all duration-200">
            <div className="relative">
                <div className="aspect-[3/4] bg-secondary-100 rounded-t-lg flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-secondary-400" />
                </div>
                {book.discountPrice && (
                    <Badge variant="danger" className="absolute top-2 right-2">
                        {Math.round(((book.price - book.discountPrice) / book.price) * 100)}% OFF
                    </Badge>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-secondary-900 mb-1 truncate-2">
                    {book.name}
                </h3>
                <p className="text-sm text-secondary-600 mb-2">by {book.author}</p>

                {book.rating && (
                    <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-secondary-600 ml-1">
                            {book.rating} ({book.reviews || 0})
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {book.discountPrice ? (
                            <>
                                <span className="text-lg font-bold text-primary-600">
                                    {formatCurrency(book.discountPrice)}
                                </span>
                                <span className="text-sm text-secondary-500 line-through">
                                    {formatCurrency(book.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary-600">
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
    );

    const BookListItem: React.FC<{ book: Book }> = ({ book }) => (
        <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex space-x-4">
                <div className="w-24 h-32 bg-secondary-100 rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-secondary-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-secondary-900 truncate">
                                {book.name}
                            </h3>
                            <p className="text-secondary-600 mb-2">by {book.author}</p>

                            {book.description && (
                                <p className="text-sm text-secondary-600 mb-3 truncate-3">
                                    {book.description}
                                </p>
                            )}

                            <div className="flex items-center space-x-4 mb-3">
                                {book.rating && (
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-secondary-600 ml-1">
                                            {book.rating} ({book.reviews || 0})
                                        </span>
                                    </div>
                                )}

                                <Badge variant="info" size="sm">
                                    {book.category}
                                </Badge>

                                <Badge variant={book.stock > 0 ? 'success' : 'danger'} size="sm">
                                    {book.stock > 0 ? `${book.stock} in stock` : 'Out of Stock'}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                            <div className="text-right">
                                {book.discountPrice ? (
                                    <>
                                        <div className="text-xl font-bold text-primary-600">
                                            {formatCurrency(book.discountPrice)}
                                        </div>
                                        <div className="text-sm text-secondary-500 line-through">
                                            {formatCurrency(book.price)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-xl font-bold text-primary-600">
                                        {formatCurrency(book.price)}
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
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
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <Layout title="Books - BookStore">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                        Discover Books
                    </h1>

                    {/* Search and Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 max-w-lg">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search books, authors, categories..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* View Mode Toggle */}
                            <div className="flex border border-secondary-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:bg-secondary-50'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter Toggle */}
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="w-64 flex-shrink-0">
                            <Card className="p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-secondary-900">Filters</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full p-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Price Range
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="w-full p-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="w-full p-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Sort Options */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full p-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                        className="w-full p-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>

                                {/* In Stock Only */}
                                <div className="flex items-center">
                                    <input
                                        id="in-stock"
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                                    />
                                    <label htmlFor="in-stock" className="ml-2 text-sm text-secondary-700">
                                        In stock only
                                    </label>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Books Grid/List */}
                    <div className="flex-1">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-secondary-600">
                                Showing {books.length} of {pagination.totalItems} books
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>

                            {pagination.totalPages > 1 && (
                                <p className="text-secondary-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </p>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : books.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                                    No books found
                                </h3>
                                <p className="text-secondary-600 mb-4">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        ) : (
                            <>
                                {/* Books Display */}
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {books.map((book) => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {books.map((book) => (
                                            <BookListItem key={book.id} book={book} />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center mt-12">
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                disabled={pagination.currentPage === 1}
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            >
                                                Previous
                                            </Button>

                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                                                const page = index + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={pagination.currentPage === page ? 'primary' : 'outline'}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}

                                            <Button
                                                variant="outline"
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BooksPage;
import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { 
  Book, 
  BookFilters, 
  PaginationParams, 
  SearchParams, 
  AdvancedSearchRequest, 
  PaginationResult, 
  SearchResult,
  StockUpdateRequest 
} from './types';
import { ResponseHandler } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Mock book database
let books: Book[] = [
  {
    id: '1',
    name: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    price: 12.99,
    stock: 50,
    description: 'A classic American novel set in the Jazz Age',
    isbn: '978-0-7432-7356-5',
    pages: 180,
    publisher: 'Scribner',
    publishedDate: '1925-04-10',
    rating: 4.2,
    reviews: 1250,
    tags: ['classic', 'american literature', 'jazz age'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    price: 14.99,
    stock: 30,
    description: 'A gripping tale of racial injustice and childhood innocence',
    isbn: '978-0-06-112008-4',
    pages: 324,
    publisher: 'J.B. Lippincott & Co.',
    publishedDate: '1960-07-11',
    rating: 4.5,
    reviews: 2100,
    tags: ['classic', 'social justice', 'coming of age'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Dune',
    author: 'Frank Herbert',
    category: 'Science Fiction',
    price: 16.99,
    stock: 25,
    description: 'Epic science fiction novel set on the desert planet Arrakis',
    isbn: '978-0-441-17271-9',
    pages: 688,
    publisher: 'Chilton Books',
    publishedDate: '1965-08-01',
    rating: 4.3,
    reviews: 890,
    tags: ['sci-fi', 'space opera', 'desert planet'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    category: 'Fiction',
    price: 13.99,
    stock: 40,
    description: 'A controversial novel about teenage rebellion and alienation',
    isbn: '978-0-316-76948-0',
    pages: 277,
    publisher: 'Little, Brown and Company',
    publishedDate: '1951-07-16',
    rating: 3.8,
    reviews: 1580,
    tags: ['coming of age', 'controversial', 'teenage'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    price: 42.99,
    stock: 15,
    description: 'A handbook of agile software craftsmanship',
    isbn: '978-0-13-235088-4',
    pages: 464,
    publisher: 'Prentice Hall',
    publishedDate: '2008-08-01',
    rating: 4.6,
    reviews: 750,
    tags: ['programming', 'software development', 'best practices'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Get all books with pagination and filtering
app.get('/books', (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    author, 
    minPrice, 
    maxPrice, 
    inStock,
    sortBy = 'name',
    sortOrder = 'asc'
  }: PaginationParams & BookFilters & { inStock?: string } = req.query as any;

  let filteredBooks = [...books];

  // Apply filters
  if (category) {
    filteredBooks = filteredBooks.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (author) {
    filteredBooks = filteredBooks.filter(p => 
      p.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (minPrice) {
    filteredBooks = filteredBooks.filter(p => p.price >= parseFloat(minPrice.toString()));
  }

  if (maxPrice) {
    filteredBooks = filteredBooks.filter(p => p.price <= parseFloat(maxPrice.toString()));
  }

  if (inStock === 'true') {
    filteredBooks = filteredBooks.filter(p => p.stock > 0);
  }

  // Apply sorting
  filteredBooks.sort((a, b) => {
    let aValue: any = a[sortBy as keyof Book];
    let bValue: any = b[sortBy as keyof Book];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Apply pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + parseInt(limit.toString());
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const pagination: PaginationResult = {
    currentPage: parseInt(page.toString()),
    totalPages: Math.ceil(filteredBooks.length / Number(limit)),
    totalItems: filteredBooks.length,
    itemsPerPage: parseInt(limit.toString())
  };

  const responseData = {
    books: paginatedBooks,
    pagination
  };
  ResponseHandler.success(res, responseData, 'Books retrieved successfully');
});

// Search books
app.get('/books/search', (req: Request, res: Response): void => {
  const { q, category, author }: SearchParams = req.query;

  if (!q) {
    ResponseHandler.badRequest(res, 'Search query is required');
    return;
  }

  const searchTerm = q.toLowerCase();
  let results = books.filter(book => {
    const matchesSearch = 
      book.name.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    const matchesCategory = !category || 
      book.category.toLowerCase().includes(category.toLowerCase());

    const matchesAuthor = !author || 
      book.author.toLowerCase().includes(author.toLowerCase());

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  // Sort by relevance (simple scoring based on matches)
  results = results.map(book => {
    let score = 0;
    const name = book.name.toLowerCase();
    const authorName = book.author.toLowerCase();
    const description = book.description.toLowerCase();

    if (name.includes(searchTerm)) score += 10;
    if (authorName.includes(searchTerm)) score += 8;
    if (description.includes(searchTerm)) score += 5;
    
    book.tags.forEach(tag => {
      if (tag.toLowerCase().includes(searchTerm)) score += 3;
    });

    return { ...book, relevanceScore: score };
  }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const searchResult: SearchResult = {
    query: q,
    results: results.map(({ relevanceScore, ...book }) => book),
    totalResults: results.length
  };

  ResponseHandler.success(res, searchResult, 'Search completed successfully');
});

// Get book by ID
app.get('/books/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const book = books.find(p => p.id === id);

  if (!book) {
    ResponseHandler.notFound(res, 'Book not found');
    return;
  }

  ResponseHandler.success(res, { book }, 'Book retrieved successfully');
});

// Create new book
app.post('/books', (req: Request, res: Response) => {
  const {
    name,
    author,
    category,
    price,
    stock,
    description,
    isbn,
    pages,
    publisher,
    publishedDate,
    tags = []
  }: Partial<Book> = req.body;

  const book: Book = {
    id: uuidv4(),
    name: name!,
    author: author!,
    category: category!,
    price: parseFloat(price!.toString()),
    stock: parseInt(stock!.toString()),
    description: description!,
    isbn: isbn!,
    pages: parseInt(pages!.toString()),
    publisher: publisher!,
    publishedDate: publishedDate!,
    rating: 0,
    reviews: 0,
    tags: tags!,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  books.push(book);
  ResponseHandler.created(res, { book }, 'Book created successfully');
});

// Update book
app.put('/books/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);

  if (bookIndex === -1) {
    ResponseHandler.notFound(res, 'Book not found');
    return;
  }

  const updatedBook: Book = {
    ...books[bookIndex],
    ...req.body,
    updatedAt: new Date()
  };

  books[bookIndex] = updatedBook;
  ResponseHandler.success(res, { book: updatedBook }, 'Book updated successfully');
});

// Delete book
app.delete('/books/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const bookIndex = books.findIndex(p => p.id === id);

  if (bookIndex === -1) {
    ResponseHandler.notFound(res, 'Book not found');
    return;
  }

  books.splice(bookIndex, 1);
  ResponseHandler.success(res, {}, 'Book deleted successfully');
});

// Update stock
app.patch('/books/:id/stock', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { quantity, operation = 'set' }: StockUpdateRequest = req.body;

  const book = books.find(p => p.id === id);
  if (!book) {
    ResponseHandler.notFound(res, 'Book not found');
    return;
  }

  switch (operation) {
    case 'add':
      book.stock += parseInt(quantity.toString());
      break;
    case 'subtract':
      book.stock = Math.max(0, book.stock - parseInt(quantity.toString()));
      break;
    case 'set':
    default:
      book.stock = parseInt(quantity.toString());
      break;
  }

  book.updatedAt = new Date();
  ResponseHandler.success(res, { book }, 'Stock updated successfully');
});

// Get categories
app.get('/categories', (req: Request, res: Response) => {
  const categories = [...new Set(books.map(p => p.category))];
  ResponseHandler.success(res, { categories }, 'Categories retrieved successfully');
});

// Get authors
app.get('/authors', (req: Request, res: Response) => {
  const authors = [...new Set(books.map(p => p.author))].sort();
  ResponseHandler.success(res, { authors }, 'Authors retrieved successfully');
});

// Advanced search with AI-like features
app.post('/books/advanced-search', (req: Request, res: Response) => {
  const { 
    query, 
    filters = {}, 
    sortBy = 'relevance',
    includeOutOfStock = false 
  }: AdvancedSearchRequest = req.body;

  let results = books;

  // Apply stock filter
  if (!includeOutOfStock) {
    results = results.filter(p => p.stock > 0);
  }

  // Apply additional filters
  Object.keys(filters).forEach(key => {
    const filterValue = filters[key as keyof BookFilters];
    if (filterValue !== undefined && filterValue !== null) {
      switch (key) {
        case 'category':
          results = results.filter(p => 
            p.category.toLowerCase() === (filterValue as string).toLowerCase()
          );
          break;
        case 'priceRange':
          const [min, max] = filterValue as [number, number];
          results = results.filter(p => p.price >= min && p.price <= max);
          break;
        case 'rating':
          results = results.filter(p => p.rating >= (filterValue as number));
          break;
        case 'tags':
          results = results.filter(p => 
            (filterValue as string[]).some(tag => 
              p.tags.some(pTag => pTag.toLowerCase().includes(tag.toLowerCase()))
            )
          );
          break;
      }
    }
  });

  // Apply text search if query provided
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(book => {
      return book.name.toLowerCase().includes(searchTerm) ||
             book.author.toLowerCase().includes(searchTerm) ||
             book.description.toLowerCase().includes(searchTerm) ||
             book.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    });
  }

  // Apply sorting
  if (sortBy === 'relevance' && query) {
    // Relevance scoring when search query is provided
    results = results.map(book => {
      let score = 0;
      const searchTerm = query.toLowerCase();
      
      if (book.name.toLowerCase().includes(searchTerm)) score += 10;
      if (book.author.toLowerCase().includes(searchTerm)) score += 8;
      if (book.description.toLowerCase().includes(searchTerm)) score += 5;
      
      return { ...book, relevanceScore: score };
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  } else {
    // Other sorting options
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  const responseData = {
    query,
    filters,
    results: results.map(({ relevanceScore, ...book }) => book),
    totalResults: results.length
  };
  ResponseHandler.success(res, responseData, 'Advanced search completed successfully');
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  const healthData = { 
    status: 'Book Details service is running', 
    timestamp: new Date().toISOString(),
    stats: {
      totalBooks: books.length,
      categories: [...new Set(books.map(p => p.category))].length,
      authors: [...new Set(books.map(p => p.author))].length,
      inStockBooks: books.filter(p => p.stock > 0).length
    }
  };
  ResponseHandler.success(res, healthData, 'Health check successful');
});

app.listen(PORT, () => {
  console.log(`Book Details service running on port ${PORT}`);
});
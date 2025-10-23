"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("./utils/response");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let books = [
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
app.get('/books', (req, res) => {
    const { page = 1, limit = 10, category, author, minPrice, maxPrice, inStock, sortBy = 'name', sortOrder = 'asc' } = req.query;
    let filteredBooks = [...books];
    if (category) {
        filteredBooks = filteredBooks.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (author) {
        filteredBooks = filteredBooks.filter(p => p.author.toLowerCase().includes(author.toLowerCase()));
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
    filteredBooks.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
    });
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + parseInt(limit.toString());
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    const pagination = {
        currentPage: parseInt(page.toString()),
        totalPages: Math.ceil(filteredBooks.length / Number(limit)),
        totalItems: filteredBooks.length,
        itemsPerPage: parseInt(limit.toString())
    };
    const responseData = {
        books: paginatedBooks,
        pagination
    };
    response_1.ResponseHandler.success(res, responseData, 'Books retrieved successfully');
});
app.get('/books/search', (req, res) => {
    const { q, category, author } = req.query;
    if (!q) {
        response_1.ResponseHandler.badRequest(res, 'Search query is required');
        return;
    }
    const searchTerm = q.toLowerCase();
    let results = books.filter(book => {
        const matchesSearch = book.name.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.description.toLowerCase().includes(searchTerm) ||
            book.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesCategory = !category ||
            book.category.toLowerCase().includes(category.toLowerCase());
        const matchesAuthor = !author ||
            book.author.toLowerCase().includes(author.toLowerCase());
        return matchesSearch && matchesCategory && matchesAuthor;
    });
    results = results.map(book => {
        let score = 0;
        const name = book.name.toLowerCase();
        const authorName = book.author.toLowerCase();
        const description = book.description.toLowerCase();
        if (name.includes(searchTerm))
            score += 10;
        if (authorName.includes(searchTerm))
            score += 8;
        if (description.includes(searchTerm))
            score += 5;
        book.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm))
                score += 3;
        });
        return { ...book, relevanceScore: score };
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    const searchResult = {
        query: q,
        results: results.map(({ relevanceScore, ...book }) => book),
        totalResults: results.length
    };
    response_1.ResponseHandler.success(res, searchResult, 'Search completed successfully');
});
app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const book = books.find(p => p.id === id);
    if (!book) {
        response_1.ResponseHandler.notFound(res, 'Book not found');
        return;
    }
    response_1.ResponseHandler.success(res, { book }, 'Book retrieved successfully');
});
app.post('/books', (req, res) => {
    const { name, author, category, price, stock, description, isbn, pages, publisher, publishedDate, tags = [] } = req.body;
    const book = {
        id: (0, uuid_1.v4)(),
        name: name,
        author: author,
        category: category,
        price: parseFloat(price.toString()),
        stock: parseInt(stock.toString()),
        description: description,
        isbn: isbn,
        pages: parseInt(pages.toString()),
        publisher: publisher,
        publishedDate: publishedDate,
        rating: 0,
        reviews: 0,
        tags: tags,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    books.push(book);
    response_1.ResponseHandler.created(res, { book }, 'Book created successfully');
});
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex === -1) {
        response_1.ResponseHandler.notFound(res, 'Book not found');
        return;
    }
    const updatedBook = {
        ...books[bookIndex],
        ...req.body,
        updatedAt: new Date()
    };
    books[bookIndex] = updatedBook;
    response_1.ResponseHandler.success(res, { book: updatedBook }, 'Book updated successfully');
});
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex(p => p.id === id);
    if (bookIndex === -1) {
        response_1.ResponseHandler.notFound(res, 'Book not found');
        return;
    }
    books.splice(bookIndex, 1);
    response_1.ResponseHandler.success(res, {}, 'Book deleted successfully');
});
app.patch('/books/:id/stock', (req, res) => {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body;
    const book = books.find(p => p.id === id);
    if (!book) {
        response_1.ResponseHandler.notFound(res, 'Book not found');
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
    response_1.ResponseHandler.success(res, { book }, 'Stock updated successfully');
});
app.get('/categories', (req, res) => {
    const categories = [...new Set(books.map(p => p.category))];
    response_1.ResponseHandler.success(res, { categories }, 'Categories retrieved successfully');
});
app.get('/authors', (req, res) => {
    const authors = [...new Set(books.map(p => p.author))].sort();
    response_1.ResponseHandler.success(res, { authors }, 'Authors retrieved successfully');
});
app.post('/books/advanced-search', (req, res) => {
    const { query, filters = {}, sortBy = 'relevance', includeOutOfStock = false } = req.body;
    let results = books;
    if (!includeOutOfStock) {
        results = results.filter(p => p.stock > 0);
    }
    Object.keys(filters).forEach(key => {
        const filterValue = filters[key];
        if (filterValue !== undefined && filterValue !== null) {
            switch (key) {
                case 'category':
                    results = results.filter(p => p.category.toLowerCase() === filterValue.toLowerCase());
                    break;
                case 'priceRange':
                    const [min, max] = filterValue;
                    results = results.filter(p => p.price >= min && p.price <= max);
                    break;
                case 'rating':
                    results = results.filter(p => p.rating >= filterValue);
                    break;
                case 'tags':
                    results = results.filter(p => filterValue.some(tag => p.tags.some(pTag => pTag.toLowerCase().includes(tag.toLowerCase()))));
                    break;
            }
        }
    });
    if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(book => {
            return book.name.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        });
    }
    if (sortBy === 'relevance' && query) {
        results = results.map(book => {
            let score = 0;
            const searchTerm = query.toLowerCase();
            if (book.name.toLowerCase().includes(searchTerm))
                score += 10;
            if (book.author.toLowerCase().includes(searchTerm))
                score += 8;
            if (book.description.toLowerCase().includes(searchTerm))
                score += 5;
            return { ...book, relevanceScore: score };
        }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
    else {
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
    response_1.ResponseHandler.success(res, responseData, 'Advanced search completed successfully');
});
app.get('/health', (req, res) => {
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
    response_1.ResponseHandler.success(res, healthData, 'Health check successful');
});
app.listen(PORT, () => {
    console.log(`Book Details service running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map
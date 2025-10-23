export interface Book {
    id: string;
    name: string;
    author: string;
    category: string;
    price: number;
    stock: number;
    description: string;
    isbn: string;
    pages: number;
    publisher: string;
    publishedDate: string;
    rating: number;
    reviews: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    relevanceScore?: number;
}
export interface BookFilters {
    category?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    priceRange?: [number, number];
    rating?: number;
    tags?: string[];
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SearchParams {
    q?: string;
    category?: string;
    author?: string;
}
export interface AdvancedSearchRequest {
    query?: string;
    filters?: BookFilters;
    sortBy?: string;
    includeOutOfStock?: boolean;
}
export interface PaginationResult {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
export interface SearchResult {
    query?: string;
    results: Book[];
    totalResults: number;
}
export interface StockUpdateRequest {
    quantity: number;
    operation?: 'set' | 'add' | 'subtract';
}
//# sourceMappingURL=index.d.ts.map
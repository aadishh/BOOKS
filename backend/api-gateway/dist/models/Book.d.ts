import mongoose, { Document, Types } from 'mongoose';
export interface IReview {
    user: Types.ObjectId;
    rating: number;
    comment?: string;
    helpful: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBookImage {
    url?: string;
    alt?: string;
    isPrimary: boolean;
}
export interface IBookDimensions {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
}
export interface IBook extends Document {
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    category: 'Fiction' | 'Non-Fiction' | 'Science' | 'Technology' | 'History' | 'Biography' | 'Romance' | 'Mystery' | 'Fantasy' | 'Horror' | 'Self-Help' | 'Business' | 'Education' | 'Children' | 'Other';
    price: number;
    discountPrice?: number;
    stock: number;
    images: IBookImage[];
    publisher?: string;
    publishedDate?: Date;
    pages?: number;
    language: string;
    format: 'Hardcover' | 'Paperback' | 'eBook' | 'Audiobook';
    dimensions?: IBookDimensions;
    reviews: IReview[];
    averageRating: number;
    totalReviews: number;
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    salesCount: number;
    createdAt: Date;
    updatedAt: Date;
    calculateAverageRating(): void;
}
declare const _default: mongoose.Model<IBook, {}, {}, {}, mongoose.Document<unknown, {}, IBook, {}, {}> & IBook & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Book.d.ts.map
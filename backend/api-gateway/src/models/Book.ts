import mongoose, { Document, Schema, Types } from 'mongoose';

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

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const bookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please provide a valid ISBN']
  },
  description: {
    type: String,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Romance', 'Mystery', 'Fantasy', 'Horror', 'Self-Help', 'Business', 'Education', 'Children', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(this: IBook, value: number) {
        return !value || value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  publisher: {
    type: String,
    trim: true,
    maxlength: 100
  },
  publishedDate: Date,
  pages: {
    type: Number,
    min: 1
  },
  language: {
    type: String,
    default: 'English'
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'],
    default: 'Paperback'
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ salesCount: -1 });

// Calculate average rating when reviews are updated
bookSchema.methods.calculateAverageRating = function(this: IBook): void {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

// Pre-save middleware to calculate average rating
bookSchema.pre<IBook>('save', function(next) {
  this.calculateAverageRating();
  next();
});

export default mongoose.model<IBook>('Book', bookSchema);
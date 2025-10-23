import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategoryImage {
  url?: string;
  alt?: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: ICategoryImage;
  parent?: Types.ObjectId;
  children: Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  bookCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    url: String,
    alt: String
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  bookCount: {
    type: Number,
    default: 0
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre<ICategory>('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Index for efficient queries
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model<ICategory>('Category', categorySchema)
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  book: Types.ObjectId;
  quantity: number;
  price: number;
  discountPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
  addItem(bookId: Types.ObjectId, quantity: number, price: number, discountPrice?: number): Promise<ICart>;
  removeItem(bookId: Types.ObjectId): Promise<ICart>;
  updateItemQuantity(bookId: Types.ObjectId, quantity: number): Promise<ICart>;
  clearCart(): Promise<ICart>;
}

const cartItemSchema = new Schema<ICartItem>({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre<ICart>('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
  this.lastModified = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(
  this: ICart,
  bookId: Types.ObjectId,
  quantity: number,
  price: number,
  discountPrice?: number
): Promise<ICart> {
  const existingItem = this.items.find(item => item.book.toString() === bookId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      book: bookId,
      quantity,
      price,
      discountPrice
    } as ICartItem);
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(this: ICart, bookId: Types.ObjectId): Promise<ICart> {
  this.items = this.items.filter(item => item.book.toString() !== bookId.toString());
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(
  this: ICart,
  bookId: Types.ObjectId,
  quantity: number
): Promise<ICart> {
  const item = this.items.find(item => item.book.toString() === bookId.toString());
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(bookId);
    } else {
      item.quantity = quantity;
      return this.save();
    }
  }
  
  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function(this: ICart): Promise<ICart> {
  this.items = [];
  return this.save();
};

export default mongoose.model<ICart>('Cart', cartSchema);
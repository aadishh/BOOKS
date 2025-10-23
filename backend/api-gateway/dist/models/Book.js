"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const bookSchema = new mongoose_1.Schema({
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
            validator: function (value) {
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
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ salesCount: -1 });
bookSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.totalReviews = 0;
    }
    else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
        this.totalReviews = this.reviews.length;
    }
};
bookSchema.pre('save', function (next) {
    this.calculateAverageRating();
    next();
});
exports.default = mongoose_1.default.model('Book', bookSchema);
//# sourceMappingURL=Book.js.map
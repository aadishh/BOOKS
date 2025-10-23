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
const cartItemSchema = new mongoose_1.Schema({
    book: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const cartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
cartSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.subtotal = this.items.reduce((total, item) => {
        const price = item.discountPrice || item.price;
        return total + (price * item.quantity);
    }, 0);
    this.lastModified = new Date();
    next();
});
cartSchema.methods.addItem = function (bookId, quantity, price, discountPrice) {
    const existingItem = this.items.find(item => item.book.toString() === bookId.toString());
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        this.items.push({
            book: bookId,
            quantity,
            price,
            discountPrice
        });
    }
    return this.save();
};
cartSchema.methods.removeItem = function (bookId) {
    this.items = this.items.filter(item => item.book.toString() !== bookId.toString());
    return this.save();
};
cartSchema.methods.updateItemQuantity = function (bookId, quantity) {
    const item = this.items.find(item => item.book.toString() === bookId.toString());
    if (item) {
        if (quantity <= 0) {
            return this.removeItem(bookId);
        }
        else {
            item.quantity = quantity;
            return this.save();
        }
    }
    throw new Error('Item not found in cart');
};
cartSchema.methods.clearCart = function () {
    this.items = [];
    return this.save();
};
exports.default = mongoose_1.default.model('Cart', cartSchema);
//# sourceMappingURL=Cart.js.map
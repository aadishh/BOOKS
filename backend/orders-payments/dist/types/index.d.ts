export interface CartItem {
    id: string;
    bookId: string;
    name: string;
    price: number;
    quantity: number;
    addedAt: Date;
}
export interface UserCart {
    userId: string;
    items: CartItem[];
    updatedAt: Date;
}
export interface WishlistItem {
    id: string;
    bookId: string;
    name: string;
    price: number;
    addedAt: Date;
}
export interface UserWishlist {
    userId: string;
    items: WishlistItem[];
    updatedAt: Date;
}
export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    customerEmail: string;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentId?: string;
    createdAt: Date;
}
export interface UserStats {
    userId: string;
    username: string;
    email: string;
    cartItemsCount: number;
    wishlistItemsCount: number;
    totalOrders: number;
    totalSpent: number;
    lastActivity: Date;
}
export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    status: 'processing' | 'completed' | 'failed';
    transactionId?: string;
    createdAt: Date;
    processedAt?: Date;
}
export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export interface PaymentResult {
    success: boolean;
    paymentId: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map
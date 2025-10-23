import mongoose, { Document, Types } from 'mongoose';
export interface IOrderItem {
    book: Types.ObjectId;
    quantity: number;
    price: number;
    discountPrice?: number;
}
export interface IShippingAddress {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
}
export interface IPaymentDetails {
    transactionId?: string;
    paymentGateway?: string;
    last4?: string;
    cardType?: string;
}
export interface IOrder extends Document {
    user: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery';
    paymentDetails?: IPaymentDetails;
    shippingAddress: IShippingAddress;
    billingAddress?: IShippingAddress;
    shippingMethod: 'standard' | 'express' | 'overnight' | 'pickup';
    trackingNumber?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    notes?: string;
    refundAmount: number;
    refundReason?: string;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Order.d.ts.map
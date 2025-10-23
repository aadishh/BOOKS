import mongoose, { Document, Types } from 'mongoose';
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
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, {}> & ICart & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Cart.d.ts.map
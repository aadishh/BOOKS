import mongoose, { Document, Types } from 'mongoose';
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
declare const _default: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Category.d.ts.map
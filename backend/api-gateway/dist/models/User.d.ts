import mongoose, { Document, Types } from 'mongoose';
export interface IUserProfile {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    twoFactorEnabled: boolean;
    profile?: IUserProfile;
    isActive: boolean;
    lastLogin?: Date;
    emailVerified: boolean;
    emailVerificationToken?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): any;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map
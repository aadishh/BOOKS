import { Types } from 'mongoose';
export declare const generateOTP: () => string;
export interface JWTPayload {
    userId: string;
    username?: string;
    role?: string;
    step?: string;
    otpKey?: string;
}
export declare const generateToken: (payload: JWTPayload, expiresIn?: string) => string;
export declare const verifyToken: (token: string) => any;
export declare const sendOTPEmail: (email: string, otp: string, username: string) => Promise<boolean>;
export declare const toObjectId: (id: string) => Types.ObjectId;
//# sourceMappingURL=auth.d.ts.map
import { OTPData } from '../types';
declare class OTPService {
    private inMemoryStorage;
    private useRedis;
    constructor();
    private checkRedisAvailability;
    set(key: string, data: OTPData): Promise<void>;
    get(key: string): Promise<OTPData | null>;
    delete(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    cleanupExpired(): void;
}
export declare const otpService: OTPService;
export {};
//# sourceMappingURL=otpService.d.ts.map
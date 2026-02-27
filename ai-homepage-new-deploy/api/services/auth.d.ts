import jwt from 'jsonwebtoken';
import { type User } from './user.js';
/**
 * Get Authorization URL
 */
export declare const getAuthUrl: () => Promise<{
    url: string;
    code_verifier: string;
}>;
/**
 * Handle Callback
 */
export declare const handleCallback: (url: string, code_verifier: string) => Promise<{
    user: User;
    token: string;
}>;
/**
 * Verify Local JWT
 */
export declare const verifyToken: (token: string) => string | jwt.JwtPayload | null;
//# sourceMappingURL=auth.d.ts.map
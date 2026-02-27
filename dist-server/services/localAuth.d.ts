import { type User } from './user.js';
interface LoginResult {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}
/**
 * 本地登录验证
 */
export declare const localLogin: (username: string, password: string) => Promise<LoginResult>;
export {};
//# sourceMappingURL=localAuth.d.ts.map
import { type User } from './user.js';
/**
 * Get CAS Authorization URL
 */
export declare const getCasAuthUrl: () => string;
/**
 * Handle CAS Callback (Validate Ticket)
 */
export declare const handleCasCallback: (ticket: string) => Promise<{
    user: User;
    token: string;
}>;
//# sourceMappingURL=cas.d.ts.map
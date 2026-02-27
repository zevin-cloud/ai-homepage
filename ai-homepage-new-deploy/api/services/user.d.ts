export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    allowedApps: string[];
    [key: string]: any;
}
export interface PartialUser {
    id: string;
    username: string;
    email: string;
    role?: 'admin' | 'user';
    allowedApps?: string[];
    [key: string]: any;
}
export declare const getUsers: () => Promise<User[]>;
export declare const saveUsers: (users: User[]) => Promise<void>;
export declare const findUserById: (id: string) => Promise<User | undefined>;
export declare const findUserByUsername: (username: string) => Promise<User | undefined>;
export declare const updateUserPermissions: (id: string, updates: {
    role?: 'admin' | 'user';
    allowedApps?: string[];
}) => Promise<User | null>;
/**
 * Create or Update user (Upsert)
 * - 更新用户时，保留现有的 role 和 allowedApps
 * - 只有当 userData 明确提供 role/allowedApps 时才更新
 * - 优先通过 id 匹配，其次通过 username 匹配以防止重复
 */
export declare const upsertUser: (userData: PartialUser) => Promise<User>;
//# sourceMappingURL=user.d.ts.map
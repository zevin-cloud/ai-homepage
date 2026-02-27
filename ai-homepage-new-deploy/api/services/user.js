import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../../users.json');
async function ensureFile() {
    try {
        await fs.access(USERS_FILE);
    }
    catch {
        await fs.writeFile(USERS_FILE, '[]', 'utf-8');
    }
}
export const getUsers = async () => {
    await ensureFile();
    try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
};
export const saveUsers = async (users) => {
    await ensureFile();
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('Error writing users file:', error);
        throw error;
    }
};
export const findUserById = async (id) => {
    const users = await getUsers();
    return users.find(u => u.id === id);
};
export const findUserByUsername = async (username) => {
    const users = await getUsers();
    return users.find(u => u.username === username);
};
export const updateUserPermissions = async (id, updates) => {
    const users = await getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1)
        return null;
    const user = users[index];
    if (updates.role)
        user.role = updates.role;
    if (updates.allowedApps)
        user.allowedApps = updates.allowedApps;
    users[index] = user;
    await saveUsers(users);
    return user;
};
/**
 * Create or Update user (Upsert)
 * - 更新用户时，保留现有的 role 和 allowedApps
 * - 只有当 userData 明确提供 role/allowedApps 时才更新
 * - 优先通过 id 匹配，其次通过 username 匹配以防止重复
 */
export const upsertUser = async (userData) => {
    const users = await getUsers();
    // 1. 尝试通过 id 匹配
    let index = users.findIndex(u => u.id === userData.id);
    // 2. 如果 id 没匹配到，尝试通过 username 匹配 (防止 CAS 用户和同步用户重复)
    if (index === -1 && userData.username) {
        index = users.findIndex(u => u.username === userData.username);
    }
    if (index !== -1) {
        const existingUser = users[index];
        // 保留现有的 role 和 allowedApps，除非 userData 明确提供了新值
        const newRole = userData.role !== undefined ? userData.role : existingUser.role;
        const newAllowedApps = userData.allowedApps !== undefined ? userData.allowedApps : existingUser.allowedApps;
        // 更新用户信息，但保留原有的 ID (如果是通过 username 匹配到的)
        users[index] = {
            ...existingUser,
            ...userData,
            id: existingUser.id, // 保持原有 ID 不变
            role: newRole,
            allowedApps: newAllowedApps
        };
        await saveUsers(users);
        return users[index];
    }
    else {
        // 创建新用户
        const newUser = {
            ...userData,
            role: userData.role || 'user',
            allowedApps: userData.allowedApps || []
        };
        users.push(newUser);
        await saveUsers(users);
        return newUser;
    }
};
//# sourceMappingURL=user.js.map
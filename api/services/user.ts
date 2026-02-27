import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../../users.json');

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  allowedApps: string[];
  [key: string]: any;
}

async function ensureFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf-8');
  }
}

export const getUsers = async (): Promise<User[]> => {
  await ensureFile();
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

export const saveUsers = async (users: User[]): Promise<void> => {
  await ensureFile();
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw error;
  }
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.id === id);
};

export const updateUserPermissions = async (
  id: string, 
  updates: { role?: 'admin' | 'user'; allowedApps?: string[] }
): Promise<User | null> => {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  const user = users[index];
  if (updates.role) user.role = updates.role;
  if (updates.allowedApps) user.allowedApps = updates.allowedApps;
  
  users[index] = user;
  await saveUsers(users);
  
  return user;
};

/**
 * Create or Update user (Upsert)
 * - 更新用户时，保留现有的 role 和 allowedApps
 * - 只有当 userData 明确提供 role/allowedApps 时才更新
 */
export const upsertUser = async (userData: User): Promise<User> => {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === userData.id);
  
  if (index !== -1) {
    const existingUser = users[index];
    
    // 保留现有的 role 和 allowedApps，除非 userData 明确提供了新值
    // 注意：这里我们检查 userData 是否明确设置了这些字段
    const newRole = userData.role !== undefined ? userData.role : existingUser.role;
    const newAllowedApps = userData.allowedApps !== undefined ? userData.allowedApps : existingUser.allowedApps;
    
    users[index] = {
      ...existingUser,
      ...userData,
      role: newRole,
      allowedApps: newAllowedApps
    };
  } else {
    // 创建新用户
    if (!userData.role) userData.role = 'user';
    if (!userData.allowedApps) userData.allowedApps = [];
    users.push(userData);
  }
  
  await saveUsers(users);
  return users.find(u => u.id === userData.id)!;
};

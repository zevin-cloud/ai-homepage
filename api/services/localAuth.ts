import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserById, findUserByUsername, upsertUser, type User } from './user.js';
import fs from 'fs';
import path from 'path';

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';
const LOCAL_USERS_FILE = path.join(process.cwd(), 'local-users.json');

interface LocalUser {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

const loadLocalUsers = (): LocalUser[] => {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading local users:', error);
  }
  return [];
};

const saveLocalUsers = (users: LocalUser[]) => {
  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving local users:', error);
  }
};

const getDefaultAdmin = async (): Promise<LocalUser> => {
  const users = loadLocalUsers();
  const existingAdmin = users.find(u => u.id === 'admin123');
  
  if (existingAdmin) {
    return existingAdmin;
  }
  
  const hashedPassword = await bcrypt.hash('123456', 10);
  const defaultAdmin: LocalUser = {
    id: 'admin123',
    username: 'admin123',
    password: hashedPassword,
    role: 'admin'
  };
  
  users.push(defaultAdmin);
  saveLocalUsers(users);
  
  return defaultAdmin;
};

getDefaultAdmin().catch(console.error);

interface LoginResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const users = loadLocalUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: '用户不存在' };
    }
    
    const user = users[userIndex];
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) {
      return { success: false, error: '原密码错误' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: '新密码长度至少6位' };
    }
    
    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    saveLocalUsers(users);
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: '修改密码失败' };
  }
};

export const resetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const users = loadLocalUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: '用户不存在' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: '新密码长度至少6位' };
    }
    
    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    saveLocalUsers(users);
    
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: '重置密码失败' };
  }
};

/**
 * 本地登录验证
 */
export const localLogin = async (username: string, password: string): Promise<LoginResult> => {
  try {
    const localUsers = loadLocalUsers();
    const localUser = localUsers.find(u => u.username === username);
    
    if (localUser) {
      const isValid = await bcrypt.compare(password, localUser.password);
      
      if (!isValid) {
        return { success: false, error: '密码错误' };
      }
      
      let user = await findUserById(localUser.id);
      
      if (!user) {
        user = await upsertUser({
          id: localUser.id,
          username: localUser.username,
          email: `${localUser.username}@local.com`,
          role: localUser.role,
          allowedApps: []
        });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        getJwtSecret(),
        { expiresIn: '24h' }
      );
      
      return { success: true, token, user };
    }
    
    const user = await findUserByUsername(username);
    
    if (!user) {
      return { success: false, error: '用户不存在' };
    }
    
    if (user.id.startsWith('cas-')) {
      return { success: false, error: '请使用 CAS 单点登录' };
    }
    
    if (user.id.startsWith('maxkb-')) {
      return { success: false, error: '请使用 MaxKB 单点登录' };
    }
    
    return { success: false, error: '密码错误' };
    
  } catch (error) {
    console.error('Local login error:', error);
    return { success: false, error: '登录失败' };
  }
};

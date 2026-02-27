import jwt from 'jsonwebtoken';
import { findUserById, findUserByUsername, upsertUser, type User } from './user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 默认管理员账号
const DEFAULT_ADMIN = {
  id: 'admin',
  username: 'admin',
  password: '123456', // 在实际应用中应该使用哈希密码
  role: 'admin' as const
};

interface LoginResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * 本地登录验证
 */
export const localLogin = async (username: string, password: string): Promise<LoginResult> => {
  try {
    // 检查是否是默认管理员
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      // 确保 admin 用户存在于数据库中
      let adminUser = await findUserById(DEFAULT_ADMIN.id);
      
      if (!adminUser) {
        adminUser = await upsertUser({
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          email: 'admin@local.com',
          role: DEFAULT_ADMIN.role,
          allowedApps: []
        });
      }
      
      const token = jwt.sign(
        { id: adminUser.id, username: adminUser.username, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return { success: true, token, user: adminUser };
    }
    
    // 检查其他本地用户 (从 users.json)
    const user = await findUserByUsername(username);
    
    if (!user) {
      return { success: false, error: '用户不存在' };
    }
    
    // 对于 CAS 同步的用户，不允许本地密码登录
    if (user.id.startsWith('cas-')) {
      return { success: false, error: '请使用 CAS 单点登录' };
    }
    
    // 简单密码验证 (实际应用中应该使用 bcrypt 等哈希验证)
    const userPassword = (user as any).password;
    if (!userPassword || userPassword !== password) {
      return { success: false, error: '密码错误' };
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return { success: true, token, user };
    
  } catch (error) {
    console.error('Local login error:', error);
    return { success: false, error: '登录失败' };
  }
};

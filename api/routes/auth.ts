import { Router, type Request, type Response } from 'express';
import { getAuthUrl, handleCallback } from '../services/auth.js';
import { getCasAuthUrl, handleCasCallback } from '../services/cas.js';
import { localLogin, changePassword, resetPassword } from '../services/localAuth.js';
import jwt from 'jsonwebtoken';
import { upsertUser, type User } from '../services/user.js';

const router: Router = Router();

const COOKIE_NAME = 'oidc_cv';
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL;
  if (!url) {
    throw new Error('FRONTEND_URL is not defined in environment variables');
  }
  return url;
};

/**
 * Local Login - Username/Password
 * POST /api/auth/local-login
 */
router.post('/local-login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
    }
    
    const result = await localLogin(username, password);
    
    if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
    }
    
    res.json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    console.error('Local login error:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

/**
 * Login - Redirect to SSO (OIDC)
 * GET /api/auth/login
 */
router.get('/login', async (req: Request, res: Response) => {
  try {
    const { url, code_verifier } = await getAuthUrl();
    
    res.cookie(COOKIE_NAME, code_verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 1000
    });

    res.redirect(url);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

/**
 * Callback - Handle SSO response (OIDC)
 * GET /api/auth/callback
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const code_verifier = req.cookies?.[COOKIE_NAME];
    
    if (!code_verifier) {
      return res.status(400).json({ error: 'Missing code_verifier cookie' });
    }

    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    const { user, token } = await handleCallback(fullUrl, code_verifier);

    res.clearCookie(COOKIE_NAME);

    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login/callback?token=${token}`);

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * CAS Login - Redirect to CAS Server
 * GET /api/auth/cas/login
 */
router.get('/cas/login', (req: Request, res: Response) => {
  try {
    const url = getCasAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.error('CAS Login error:', error);
    res.status(500).json({ error: 'Failed to initiate CAS login' });
  }
});

/**
 * CAS Callback - Handle CAS Ticket
 * GET /api/auth/cas/callback
 */
router.get('/cas/callback', async (req: Request, res: Response) => {
  try {
    const ticket = req.query.ticket as string;
    
    if (!ticket) {
      return res.status(400).json({ error: 'Missing CAS ticket' });
    }

    const { user, token } = await handleCasCallback(ticket);

    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login/callback?token=${token}`);

  } catch (error) {
    console.error('CAS Callback error:', error);
    res.status(500).json({ error: 'CAS Authentication failed' });
  }
});

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out' });
});

/**
 * Change Password
 * POST /api/auth/change-password
 */
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未授权' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: '请填写完整信息' });
    }
    
    const result = await changePassword(decoded.id, oldPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: '修改密码失败' });
  }
});

/**
 * Reset Password (Admin only)
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未授权' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无权限' });
    }
    
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, error: '请填写完整信息' });
    }
    
    const result = await resetPassword(userId, newPassword);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: '重置密码失败' });
  }
});

/**
 * Get current user info
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未授权' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; username: string; role: string };
    
    res.json({ 
      success: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(401).json({ success: false, error: '无效的 token' });
  }
});

export default router;

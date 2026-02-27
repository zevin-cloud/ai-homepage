import { Router, type Request, type Response } from 'express';
import { getAuthUrl, handleCallback } from '../services/auth.js';
import { getCasAuthUrl, handleCasCallback } from '../services/cas.js';
import jwt from 'jsonwebtoken';
import { upsertUser, type User } from '../services/user.js';

const router: Router = Router();

const COOKIE_NAME = 'oidc_cv';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Dev Login - For testing without SSO
 * GET /api/auth/dev-login
 */
router.get('/dev-login', async (req: Request, res: Response) => {
  try {
    // Create a test admin user
    const user: User = {
      id: 'dev-admin',
      username: 'Dev Admin',
      email: 'dev@test.com',
      role: 'admin',
      allowedApps: []
    };
    
    await upsertUser(user);
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login/callback?token=${token}`);
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: 'Dev login failed' });
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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

export default router;

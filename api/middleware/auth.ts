import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '../services/auth.js';
import { findUserById } from '../services/user.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to verify JWT token
 * When PUBLIC_ACCESS=true, creates a guest user for unauthenticated requests
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const publicAccess = process.env.PUBLIC_ACCESS === 'true';
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (publicAccess) {
      req.user = {
        id: 'guest',
        username: 'guest',
        email: '',
        role: 'guest',
        allowedApps: []
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    if (publicAccess) {
      req.user = {
        id: 'guest',
        username: 'guest',
        email: '',
        role: 'guest',
        allowedApps: []
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const user = await findUserById((decoded as any).id);
  
  if (!user) {
    if (publicAccess) {
      req.user = {
        id: 'guest',
        username: 'guest',
        email: '',
        role: 'guest',
        allowedApps: []
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: User not found' });
  }

  req.user = user;
  next();
};

/**
 * Middleware to require Admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

/**
 * Middleware to require access to a specific App
 * Expects app_id in req.params or req.body or req.query
 */
export const requireAppAccess = (appIdExtractor: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Admins have access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Guest users have access to all apps in public access mode
    if (req.user.role === 'guest' && process.env.PUBLIC_ACCESS === 'true') {
      return next();
    }

    const appId = appIdExtractor(req);
    if (!appId) {
      return res.status(400).json({ error: 'Bad Request: App ID missing' });
    }

    if (req.user.allowedApps && req.user.allowedApps.includes(appId)) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: You do not have access to this app' });
  };
};

import { verifyToken } from '../services/auth.js';
import { findUserById } from '../services/user.js';
/**
 * Middleware to verify JWT token
 */
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    // Optional: Fetch full user from DB to ensure latest permissions
    // For performance, we might trust the token claims, but for permission updates to take effect immediately, fetching is better.
    // Let's fetch from DB.
    const user = await findUserById(decoded.id);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
};
/**
 * Middleware to require Admin role
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
/**
 * Middleware to require access to a specific App
 * Expects app_id in req.params or req.body or req.query
 */
export const requireAppAccess = (appIdExtractor) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Admins have access to everything
        if (req.user.role === 'admin') {
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
//# sourceMappingURL=auth.js.map
import * as client from 'openid-client';
import jwt from 'jsonwebtoken';
import { upsertUser } from './user.js';
// Configuration from environment variables
const ISSUER_URL = process.env.OIDC_ISSUER || 'https://example.com'; // Replace with actual issuer
const CLIENT_ID = process.env.OIDC_CLIENT_ID || 'client-id';
const CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || 'client-secret';
const REDIRECT_URI = process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Should be strong in production
let oidcConfig;
/**
 * Initialize OIDC Configuration
 */
const getOidcConfig = async () => {
    if (oidcConfig)
        return oidcConfig;
    try {
        // Discovery
        oidcConfig = await client.discovery(new URL(ISSUER_URL), CLIENT_ID, CLIENT_SECRET);
        return oidcConfig;
    }
    catch (error) {
        console.error('Failed to discover OIDC configuration:', error);
        throw error;
    }
};
/**
 * Get Authorization URL
 */
export const getAuthUrl = async () => {
    const config = await getOidcConfig();
    const code_challenge_method = 'S256';
    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
    // Store code_verifier in session or cookie (simplified here, returning it to be stored by controller)
    // In a real app, use a session middleware or signed cookie
    const parameters = {
        redirect_uri: REDIRECT_URI,
        scope: 'openid profile email',
        code_challenge,
        code_challenge_method,
    };
    const redirectTo = client.buildAuthorizationUrl(config, parameters);
    return { url: redirectTo.href, code_verifier };
};
/**
 * Handle Callback
 */
export const handleCallback = async (url, code_verifier) => {
    const config = await getOidcConfig();
    const tokens = await client.authorizationCodeGrant(config, new URL(url), {
        pkceCodeVerifier: code_verifier,
        expectedState: undefined, // Add state check if implemented
        idTokenExpected: true,
    });
    const claims = tokens.claims();
    if (!claims) {
        throw new Error('No claims found in ID Token');
    }
    // Map OIDC user to local User
    const user = {
        id: claims.sub,
        username: claims.name || claims.preferred_username || 'Unknown',
        email: claims.email || '',
        role: 'user', // Default role
        allowedApps: [],
        oidc_data: claims
    };
    // Save/Update user in local DB
    const savedUser = await upsertUser(user);
    // Issue local JWT
    const token = jwt.sign({
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role
    }, JWT_SECRET, { expiresIn: '24h' });
    return { user: savedUser, token };
};
/**
 * Verify Local JWT
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=auth.js.map
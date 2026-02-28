import * as client from 'openid-client';
import jwt from 'jsonwebtoken';
import { upsertUser, type User } from './user.js';

const getIssuerUrl = () => process.env.OIDC_ISSUER || 'https://example.com';
const getClientId = () => process.env.OIDC_CLIENT_ID || 'client-id';
const getClientSecret = () => process.env.OIDC_CLIENT_SECRET || 'client-secret';
const getRedirectUri = () => process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';

let oidcConfig: client.Configuration;

const getOidcConfig = async () => {
  if (oidcConfig) return oidcConfig;

  const issuerUrl = getIssuerUrl();
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  
  try {
    let issuerUrlValue = issuerUrl;
    if (issuerUrlValue.endsWith('/')) {
      issuerUrlValue = issuerUrlValue.slice(0, -1);
    }
    
    const discoveryUrl = `${issuerUrlValue}/.well-known/openid-configuration`;
    console.log('Discovering OIDC from:', discoveryUrl);
    
    const response = await fetch(discoveryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OIDC configuration: ${response.status}`);
    }
    const metadata = await response.json() as { issuer?: string };
    console.log('OIDC metadata:', metadata);
    
    const actualIssuer = metadata.issuer || issuerUrlValue;
    
    oidcConfig = await client.discovery(
      new URL(actualIssuer),
      clientId,
      clientSecret,
      undefined,
      {
        [client.customFetch]: (url, options) => {
          let adjustedUrl = url.toString();
          if (adjustedUrl.startsWith(actualIssuer) && actualIssuer !== issuerUrlValue) {
            adjustedUrl = adjustedUrl.replace(actualIssuer, issuerUrlValue);
          }
          console.log('OIDC request:', adjustedUrl);
          return fetch(adjustedUrl, options);
        }
      }
    );
    
    console.log('OIDC Discovery successful');
    return oidcConfig;
  } catch (error) {
    console.error('Failed to discover OIDC configuration:', error);
    throw error;
  }
};

export const getAuthUrl = async () => {
  const config = await getOidcConfig();
  const code_challenge_method = 'S256';
  const code_verifier = client.randomPKCECodeVerifier();
  const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);

  const parameters: Record<string, string> = {
    redirect_uri: getRedirectUri(),
    scope: 'openid profile email',
    code_challenge,
    code_challenge_method,
  };

  const redirectTo = client.buildAuthorizationUrl(config, parameters);
  
  const issuerUrl = getIssuerUrl();
  let finalUrl = redirectTo.href;
  const actualIssuer = config.serverMetadata().issuer;
  if (actualIssuer && finalUrl.startsWith(actualIssuer) && actualIssuer !== issuerUrl) {
    finalUrl = finalUrl.replace(actualIssuer, issuerUrl);
  }
  
  console.log('OIDC Auth URL:', finalUrl);
  
  return { url: finalUrl, code_verifier };
};

export const handleCallback = async (url: string, code_verifier: string) => {
  const config = await getOidcConfig();
  
  console.log('Handling OIDC callback:', url);
  
  const callbackUrl = new URL(url);
  if (callbackUrl.searchParams.get('state') === '') {
    callbackUrl.searchParams.delete('state');
  }
  
  const tokens = await client.authorizationCodeGrant(
    config,
    callbackUrl,
    {
      pkceCodeVerifier: code_verifier,
      expectedState: undefined,
      idTokenExpected: true,
    }
  );

  const claims = tokens.claims();
  if (!claims) {
    throw new Error('No claims found in ID Token');
  }

  console.log('OIDC claims:', claims);

  const user: User = {
    id: `oidc-${claims.sub}`,
    username: (claims.name as string) || (claims.preferred_username as string) || (claims.email as string)?.split('@')[0] || 'Unknown',
    email: (claims.email as string) || '',
    role: 'user',
    allowedApps: [],
    oidc_data: claims
  };

  const savedUser = await upsertUser(user);

  const token = jwt.sign(
    { 
      id: savedUser.id, 
      username: savedUser.username, 
      role: savedUser.role 
    },
    getJwtSecret(),
    { expiresIn: '24h' }
  );

  return { user: savedUser, token };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

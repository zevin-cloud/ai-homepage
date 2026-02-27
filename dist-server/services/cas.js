import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import jwt from 'jsonwebtoken';
import { upsertUser, findUserById } from './user.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const getCasConfig = () => ({
    serverUrl: process.env.CAS_SERVER_URL || 'https://cas.example.com/cas',
    serviceUrl: process.env.CAS_SERVICE_URL || 'http://localhost:3001/api/auth/cas/callback'
});
/**
 * Get CAS Authorization URL
 */
export const getCasAuthUrl = () => {
    const config = getCasConfig();
    console.log('CAS Config:', config);
    return `${config.serverUrl}/login?service=${encodeURIComponent(config.serviceUrl)}`;
};
/**
 * Handle CAS Callback (Validate Ticket)
 */
export const handleCasCallback = async (ticket) => {
    const config = getCasConfig();
    try {
        const validateUrl = `${config.serverUrl}/serviceValidate`;
        console.log('CAS Validate URL:', validateUrl);
        console.log('CAS Service URL:', config.serviceUrl);
        console.log('CAS Ticket:', ticket);
        const response = await axios.get(validateUrl, {
            params: {
                service: config.serviceUrl,
                ticket: ticket
            }
        });
        console.log('CAS Response:', response.data);
        const result = await parseStringPromise(response.data, {
            explicitArray: false,
            tagNameProcessors: [(name) => name.replace('cas:', '')]
        });
        console.log('CAS Parsed Result:', JSON.stringify(result, null, 2));
        if (!result.serviceResponse || !result.serviceResponse.authenticationSuccess) {
            const failureMsg = result.serviceResponse?.authenticationFailure || 'Unknown error';
            console.error('CAS Validation Failed:', failureMsg);
            throw new Error(`CAS Authentication Failed: ${failureMsg}`);
        }
        const success = result.serviceResponse.authenticationSuccess;
        const username = success.user;
        const attributes = success.attributes || {};
        const email = attributes.email || attributes['cas:email'] || '';
        // Check if user already exists to preserve role and permissions
        const existingUser = await findUserById(`cas-${username}`);
        // Prepare user data - DO NOT include role/allowedApps to preserve existing values
        const user = {
            id: `cas-${username}`,
            username: username,
            email: email,
            // 不设置 role 和 allowedApps，让 upsertUser 保留现有值
            // 如果是新用户，upsertUser 会设置默认值
            cas_data: {
                username,
                attributes
            }
        };
        // Save/Update user - this will preserve existing role and allowedApps
        const savedUser = await upsertUser(user);
        const token = jwt.sign({
            id: savedUser.id,
            username: savedUser.username,
            role: savedUser.role
        }, JWT_SECRET, { expiresIn: '24h' });
        return { user: savedUser, token };
    }
    catch (error) {
        console.error('CAS Callback Error:', error);
        throw error;
    }
};
//# sourceMappingURL=cas.js.map
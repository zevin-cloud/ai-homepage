import axios from 'axios';
import https from 'https';
import { upsertUser, getUsers, saveUsers, type User } from './user.js';

interface MaxKBUser {
  id: string;
  username: string;
  email?: string;
  is_active?: boolean;
  role?: string;
  [key: string]: any;
}

export const syncMaxKBUsers = async () => {
  console.log('Starting MaxKB User sync...');
  
  // 从环境变量读取配置，不硬编码默认值
  const MAXKB_BASE_URL = process.env.MAXKB_BASE_URL;
  const MAXKB_USER_TOKEN = process.env.MAXKB_API_KEY;
  
  if (!MAXKB_BASE_URL) {
    throw new Error('MAXKB_BASE_URL is not defined in environment variables');
  }
  
  if (!MAXKB_USER_TOKEN) {
    throw new Error('MAXKB_API_KEY is not defined in environment variables');
  }
  
  const MAXKB_USER_API_URL = `${MAXKB_BASE_URL}/admin/api/system/chat_user/user_manage/1/100`;
  
  try {
    const response = await axios.get(MAXKB_USER_API_URL, {
      headers: {
        'Authorization': `Bearer ${MAXKB_USER_TOKEN}`,
      },
      // 忽略 SSL 证书错误，与 maxkb.ts 保持一致
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    const records = response.data?.data?.records || response.data?.data || [];
    
    if (!Array.isArray(records)) {
      console.error('Unexpected API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }

    console.log(`Found ${records.length} users from MaxKB.`);

    // 获取当前本地用户列表，用于后续删除不再存在的用户
    const maxkbUsernames = new Set(records.map((r: any) => r.username || r.name || r.email).filter(Boolean));

    let syncedCount = 0;
    for (const record of records) {
      // Map MaxKB user to our User interface
      const username = record.username || record.name || record.email || 'Unknown';
      const userId = record.id;
      
      // 检查用户是否已存在，如果存在则保留其 role 和 allowedApps
      const existingUser = await upsertUser({
        id: userId,
        username: username,
        email: record.email || ''
      });
      
      syncedCount++;
    }

    // 删除逻辑：如果本地用户不在 MaxKB 列表中，且不是默认 admin，则删除
    let deletedCount = 0;
    const updatedLocalUsers = await getUsers();
    const finalUsers = updatedLocalUsers.filter(user => {
      // 始终保留 admin 用户
      if (user.username === 'admin' || user.role === 'admin') {
        return true;
      }
      
      // 如果用户在 MaxKB 中 (通过 username 匹配)，保留
      if (maxkbUsernames.has(user.username)) {
        return true;
      }

      // 如果用户不在 MaxKB 中，且不是 admin，则删除
      console.log(`Deleting user ${user.username} (ID: ${user.id}) as they are no longer in MaxKB.`);
      deletedCount++;
      return false;
    });

    if (deletedCount > 0) {
      await saveUsers(finalUsers);
    }

    console.log(`Successfully synced ${syncedCount} users, deleted ${deletedCount} users.`);
    return { success: true, count: syncedCount, deletedCount };

  } catch (error) {
    console.error('MaxKB User sync failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data || error.message);
    }
    throw error;
  }
};

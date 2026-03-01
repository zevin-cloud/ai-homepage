import axios from 'axios';
import https from 'https';
import { upsertUser, getUsers, saveUsers, findUserById, type User } from './user.js';

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

    console.log('MaxKB API Response code:', response.data?.code);
    console.log('MaxKB API Response message:', response.data?.message);

    // 处理不同版本的 API 响应结构
    // 专业版和企业版都使用 data.records 结构
    let records: any[] = [];
    
    if (response.data?.data?.records && Array.isArray(response.data.data.records)) {
      // 标准结构: { code: 200, data: { records: [...], total: xxx } }
      records = response.data.data.records;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // 备选结构: { code: 200, data: [...] }
      records = response.data.data;
    } else if (Array.isArray(response.data)) {
      // 直接数组结构
      records = response.data;
    }
    
    if (!Array.isArray(records) || records.length === 0) {
      console.error('Unexpected API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid API response structure: no records found');
    }

    console.log(`Found ${records.length} users from MaxKB.`);

    // 获取当前本地用户列表，用于后续删除不再存在的用户
    const maxkbUserIds = new Set(records.map((r: any) => r.id).filter(Boolean));
    console.log(`MaxKB user IDs count: ${maxkbUserIds.size}`);

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      // Map MaxKB user to our User interface
      const username = record.username || record.name || record.email || 'Unknown';
      const userId = record.id;
      
      if (!userId) {
        console.warn('Skipping user without ID:', record);
        continue;
      }
      
      // 检查用户是否已存在
      const existingUser = await findUserById(userId);
      
      // 保存完整的 MaxKB 用户数据
      const userData: Partial<User> & { id: string; username: string; email: string } = {
        id: userId,
        username: username,
        email: record.email || '',
        maxkb_data: record // 保存完整的 MaxKB 用户数据
      };
      
      // 如果是新用户，设置默认值
      if (!existingUser) {
        userData.role = 'user';
        userData.allowedApps = [];
        createdCount++;
      } else {
        updatedCount++;
      }
      
      // 保存用户
      await upsertUser(userData);
      syncedCount++;
    }

    console.log(`Synced ${syncedCount} users: ${createdCount} created, ${updatedCount} updated.`);

    // 删除逻辑：如果本地用户不在 MaxKB 列表中，且不是默认 admin，则删除
    let deletedCount = 0;
    const updatedLocalUsers = await getUsers();
    const finalUsers = updatedLocalUsers.filter(user => {
      // 始终保留 admin 用户
      if (user.username === 'admin' || user.role === 'admin') {
        return true;
      }
      
      // 如果用户在 MaxKB 中 (通过 ID 匹配)，保留
      if (maxkbUserIds.has(user.id)) {
        return true;
      }
      
      // 如果用户有 maxkb_data 但不在 MaxKB 列表中，说明已被删除
      if (user.maxkb_data) {
        console.log(`Deleting user ${user.username} (ID: ${user.id}) as they are no longer in MaxKB.`);
        deletedCount++;
        return false;
      }
      
      // 保留非 MaxKB 用户（如本地用户、CAS 用户）
      return true;
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

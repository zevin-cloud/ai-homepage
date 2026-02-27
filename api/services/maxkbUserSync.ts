import axios from 'axios';
import { upsertUser, type User } from './user.js';

const MAXKB_BASE_URL = process.env.MAXKB_BASE_URL || 'https://mk2.zevin.xin:20000';
const MAXKB_USER_API_URL = `${MAXKB_BASE_URL}/admin/api/system/chat_user/user_manage/1/100`;
const MAXKB_USER_TOKEN = process.env.MAXKB_API_KEY || 'user-e231ba6ec07aa0a491117a2a7abae662';

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
  
  try {
    const response = await axios.get(MAXKB_USER_API_URL, {
      headers: {
        // Trying Bearer prefix
        'Authorization': `Bearer ${MAXKB_USER_TOKEN}`,
      }
    });

    // Log the structure to help debugging if it fails
    // console.log('MaxKB User API Response:', JSON.stringify(response.data, null, 2));

    const records = response.data?.data?.records || response.data?.data || [];
    
    if (!Array.isArray(records)) {
      console.error('Unexpected API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }

    console.log(`Found ${records.length} users from MaxKB.`);

    let syncedCount = 0;
    for (const record of records) {
      // Map MaxKB user to our User interface
      const user: User = {
        id: record.id,
        username: record.username || record.name || record.email || 'Unknown',
        email: record.email || '',
        // Default role is 'user', admin status is managed locally
        role: 'user', 
        allowedApps: [], // Default no apps, managed locally
        // Store original data for reference
        maxkb_data: record
      };

      await upsertUser(user);
      syncedCount++;
    }

    console.log(`Successfully synced ${syncedCount} users.`);
    return { success: true, count: syncedCount };

  } catch (error) {
    console.error('MaxKB User sync failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data || error.message);
    }
    throw error;
  }
};

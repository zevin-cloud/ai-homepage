import axios from 'axios';
import https from 'https';

const MAXKB_BASE_URL = 'https://mk2.zevin.xin:20000';
const MAXKB_USER_API_URL = `${MAXKB_BASE_URL}/admin/api/system/chat_user/user_manage/1/100`;
const MAXKB_USER_TOKEN = 'user-e231ba6ec07aa0a491117a2a7abae662';

async function test() {
  try {
    const response = await axios.get(MAXKB_USER_API_URL, {
      headers: {
        'Authorization': `Bearer ${MAXKB_USER_TOKEN}`,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

test();

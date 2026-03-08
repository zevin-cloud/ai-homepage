import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config({ path: '/root/code/ai-homepage/.env' });

const apiKey = process.env.MAXKB_API_KEY;
const baseURL = process.env.MAXKB_BASE_URL;
const workspaceId = process.env.MAXKB_WORKSPACE_ID || 'default';
const appId = '0198e059-cb3b-7642-a7b2-7419522bc5ac'; // From data.json

const client = axios.create({
    baseURL,
    headers: {
        Authorization: `Bearer ${apiKey}`,
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

async function probe() {
    const paths = [
        `/admin/api/workspace/${workspaceId}/application/${appId}/statistics`,
        `/admin/api/workspace/${workspaceId}/application/${appId}/statistics/`,
        `/admin/api/workspace/${workspaceId}/application/${appId}/statistic`,
        `/api/application/${appId}/statistics`,
        `/api/application/${appId}/statistic`,
        `/admin/application/${appId}/statistics`,
        `/admin/application/${appId}/statistic`,
        `/admin/api/application/${appId}/statistics`,
        `/admin/api/application/${appId}/statistic`,
        `/admin/api/workspace/${workspaceId}/chat_record/page`,
        `/admin/api/workspace/${workspaceId}/application/${appId}/chat_record/page`,
        `/admin/api/workspace/${workspaceId}/application/${appId}/chat/record`,
        `/admin/api/application/${appId}/chat_record/1/20`,
        `/api/application/${appId}/chat_record/1/20`,
        `/api/application/${appId}/chat/record`,
        `/admin/api/application/${appId}/chat/record`,
        `/admin/api/application/${appId}/chat/record/page`,
        `/api/application/${appId}/chat_record/page`
    ];

    for (const path of paths) {
        try {
            console.log(`Testing GET ${path}...`);
            const res = await client.get(path);
            console.log(`SUCCESS [GET ${path}]: ${res.status}`);
            console.log(JSON.stringify(res.data).substring(0, 100));
        } catch (err) {
            console.log(`FAILED [GET ${path}]: ${err.response ? err.response.status : err.message}`);
        }

        try {
            console.log(`Testing POST ${path}...`);
            const res = await client.post(path, { page: 1, size: 20 });
            console.log(`SUCCESS [POST ${path}]: ${res.status}`);
            console.log(JSON.stringify(res.data).substring(0, 100));
        } catch (err) {
            console.log(`FAILED [POST ${path}]: ${err.response ? err.response.status : err.message}`);
        }
    }
}

probe();

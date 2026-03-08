import dotenv from 'dotenv';
dotenv.config();
import { getAppStatistics, getChatLogs } from './api/services/maxkb.js';

async function test() {
    const appId = '0198e059-cb3b-7642-a7b2-7419522bc5ac';
    console.log('Testing getAppStatistics...');
    const stats = await getAppStatistics(appId);
    console.log(JSON.stringify(stats, null, 2));

    console.log('\nTesting getChatLogs...');
    const logs = await getChatLogs(appId, 1, 10);
    console.log(JSON.stringify(logs, null, 2));
}

test().catch(console.error);

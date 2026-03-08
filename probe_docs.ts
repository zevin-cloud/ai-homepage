import axios from 'axios';
import https from 'https';

const client = axios.create({
    baseURL: 'https://mk2.zevin.xin:20000',
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

const docs = [
    '/swagger-ui.html',
    '/v3/api-docs',
    '/api/docs',
    '/api/schema',
    '/openapi.json',
    '/api/swagger-ui.html',
    '/admin/api/schema',
    '/admin/api/docs',
    '/swagger.json',
    '/api/swagger.json',
    '/api/v1/swagger.json',
    '/api/openapi.json',
    '/admin/api/openapi.json'
];

async function run() {
    for (let doc of docs) {
        try {
            const res = await client.get(doc);
            console.log(`[${doc}] -> ${res.status} Content-Type: ${res.headers['content-type']}`);
            if (res.headers['content-type']?.includes('json')) {
                console.log('FOUND JSON DOC:', doc);
                const fs = await import('fs');
                fs.writeFileSync('maxkb_openapi.json', JSON.stringify(res.data));
                break;
            }
        } catch (e: any) {
            console.log(`[${doc}] -> ${e.response?.status || e.message}`);
        }
    }
}
run();

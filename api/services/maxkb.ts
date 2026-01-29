import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data.json');

const MAXKB_API_KEY = process.env.MAXKB_API_KEY;
const MAXKB_BASE_URL = process.env.MAXKB_BASE_URL;
const MAXKB_ROOT_FOLDER = process.env.MAXKB_ROOT_FOLDER || 'Portal';
const MAXKB_WORKSPACE_ID = process.env.MAXKB_WORKSPACE_ID || 'default';

console.log('MAXKB Config:', {
  baseURL: MAXKB_BASE_URL,
  rootFolder: MAXKB_ROOT_FOLDER,
  workspaceId: MAXKB_WORKSPACE_ID,
  hasApiKey: !!MAXKB_API_KEY
});

const api = axios.create({
  baseURL: MAXKB_BASE_URL,
  headers: {
    Authorization: `Bearer ${MAXKB_API_KEY}`,
  },
});

export const syncMaxKBData = async () => {
  try {
    console.log('Starting MaxKB sync...');
    
    // 重新加载环境变量确保可用
    const apiKey = process.env.MAXKB_API_KEY;
    const baseURL = process.env.MAXKB_BASE_URL;
    const rootFolderName = process.env.MAXKB_ROOT_FOLDER || 'Portal';
    const workspaceId = process.env.MAXKB_WORKSPACE_ID || 'default';

    if (!baseURL) {
      throw new Error('MAXKB_BASE_URL is not defined in environment variables');
    }

    const client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      // 忽略 SSL 证书错误
      httpsAgent: new (await import('https')).Agent({  
        rejectUnauthorized: false
      })
    });

    // 1. 获取所有文件夹
    const foldersRes = await client.get(`/admin/api/workspace/${workspaceId}/APPLICATION/folder`);
    const folders = foldersRes.data.data;

    // 2. 查找根文件夹（例如 "Portal"）
    // 注意：API 返回嵌套结构，"Portal" 可能是 "default" 的子文件夹
    let rootFolder = folders.find((f: any) => f.name === rootFolderName);
    
    // 如果在顶层没找到，检查 "default" 的子文件夹
    if (!rootFolder) {
      for (const folder of folders) {
        if (folder.children) {
          rootFolder = folder.children.find((f: any) => f.name === rootFolderName);
          if (rootFolder) break;
        }
      }
    }

    if (!rootFolder) {
      console.log('Available folders:', JSON.stringify(folders, null, 2));
      throw new Error(`Root folder "${rootFolderName}" not found.`);
    }

    // 3. 获取子文件夹（分类）
    // 如果 rootFolder 有 children 属性，直接使用
    let categories = [];
    if (rootFolder.children && rootFolder.children.length > 0) {
      categories = rootFolder.children;
    } else {
      // 回退方案：通过 parent_id 过滤
      categories = folders.filter((f: any) => f.parent_id === rootFolder.id);
    }

    // 如果没有找到分类，将根文件夹作为默认分类
    if (categories.length === 0) {
      console.log('No subcategories found, using root folder as default category');
      categories = [rootFolder];
    }

    console.log(`Found ${categories.length} categories.`);

    const result = [];

    for (const cat of categories) {
      const categoryData = {
        id: cat.id,
        name: cat.name,
        agents: [] as any[],
      };

      // 4. 获取该分类下的应用
      const appsRes = await client.get(`/admin/api/workspace/${workspaceId}/application/1/30?folder_id=${cat.id}`);
      const apps = appsRes.data.data.records;

      console.log(`Found ${apps.length} apps in category "${cat.name}".`);

      for (const app of apps) {
        let iconUrl = '';
        if (app.icon) {
          if (app.icon.startsWith('http')) {
            // 完整 URL，直接使用
            iconUrl = app.icon;
          } else if (app.icon.startsWith('./oss/file/')) {
            // 处理以 ./oss/file/ 开头的相对路径
            // 示例：./oss/file/019c04ea-2dca-77f2-8398-fea781afd9b8
            // 转换为：{baseURL}/admin/oss/file/{id}
            const fileId = app.icon.replace('./oss/file/', '');
            iconUrl = `${baseURL}/admin/oss/file/${fileId}`;
          } else if (app.icon.includes('/admin/oss/file/')) {
            // 处理包含 /admin/oss/file/ 的路径
            iconUrl = app.icon.startsWith('http') ? app.icon : `${baseURL}${app.icon}`;
          } else if (app.icon.startsWith('./')) {
            // 处理其他相对路径如 "./favicon.ico"
            // 这些是默认图标，设为空（会显示备用图标）
            iconUrl = '';
          } else if (app.icon.includes('.')) {
            // 可能是文件名如 favicon.ico，设为空
            iconUrl = '';
          } else {
            // 假设是文件 ID（UUID），构建完整 URL
            // 格式：${baseURL}/admin/oss/file/{id}
            iconUrl = `${baseURL}/admin/oss/file/${app.icon}`;
          }
          console.log(`Processed icon for app ${app.name}: ${app.icon} -> ${iconUrl}`);
        } else if (app.icon_file_id) {
          // 处理 icon 存储在 icon_file_id 字段的情况
          iconUrl = `${baseURL}/admin/oss/file/${app.icon_file_id}`;
          console.log(`Processed icon from icon_file_id for app ${app.name}: ${app.icon_file_id} -> ${iconUrl}`);
        }

        // 获取应用的 access_token
        let chatUrl = '';
        try {
          const accessTokenRes = await client.get(`/admin/api/workspace/${workspaceId}/application/${app.id}/access_token`);
          if (accessTokenRes.data.code === 200 && accessTokenRes.data.data?.access_token) {
            const accessToken = accessTokenRes.data.data.access_token;
            chatUrl = `${baseURL}/chat/${accessToken}`;
            console.log(`Got access_token for app ${app.name}: ${accessToken}`);
          } else {
            console.warn(`Failed to get access_token for app ${app.name}, using fallback URL`);
            chatUrl = `${baseURL}/chat/${app.id}`;
          }
        } catch (error) {
          console.error(`Error getting access_token for app ${app.name}:`, error);
          chatUrl = `${baseURL}/chat/${app.id}`;
        }

        categoryData.agents.push({
          id: app.id,
          title: app.name,
          description: app.desc || '',
          icon: iconUrl,
          url: chatUrl,
        });
      }
      
      result.push(categoryData);
    }

    // 保存到 JSON 文件
    await fs.writeFile(DATA_FILE, JSON.stringify(result, null, 2));

    console.log('MaxKB sync completed successfully.');
    return { success: true };
  } catch (error) {
    console.error('MaxKB sync failed:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回空数组
    return [];
  }
};

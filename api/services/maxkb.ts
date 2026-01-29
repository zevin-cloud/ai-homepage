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
    
    // Reload env vars to ensure they are available
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
      // Ignore SSL certificate errors
      httpsAgent: new (await import('https')).Agent({  
        rejectUnauthorized: false
      })
    });

    // 1. Get all folders
    const foldersRes = await client.get(`/admin/api/workspace/${workspaceId}/APPLICATION/folder`);
    const folders = foldersRes.data.data;

    // 2. Find the root folder (e.g., "Portal")
    // Note: The API returns a nested structure where "Portal" might be a child of "default"
    // We need to search recursively or check the structure
    let rootFolder = folders.find((f: any) => f.name === rootFolderName);
    
    // If not found at top level, check children of "default" (or other top-level folders)
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

    // 3. Get subfolders (Categories)
    // If rootFolder has children property, use that directly
    let categories = [];
    if (rootFolder.children && rootFolder.children.length > 0) {
      categories = rootFolder.children;
    } else {
      // Fallback to filtering by parent_id if children array is empty but structure is flat
      categories = folders.filter((f: any) => f.parent_id === rootFolder.id);
    }

    // If no categories found, create a default category and put all apps in it
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

      // 4. Get applications for this category
      const appsRes = await client.get(`/admin/api/workspace/${workspaceId}/application/1/30?folder_id=${cat.id}`);
      const apps = appsRes.data.data.records;

      console.log(`Found ${apps.length} apps in category "${cat.name}".`);

      for (const app of apps) {
        let iconUrl = '';
        if (app.icon) {
          if (app.icon.startsWith('http')) {
            // Full URL, use as is
            iconUrl = app.icon;
          } else if (app.icon.startsWith('./oss/file/')) {
            // Handle relative path starting with ./oss/file/
            // Example: ./oss/file/019c04ea-2dca-77f2-8398-fea781afd9b8
            // Should become: {baseURL}/admin/oss/file/{id}
            const fileId = app.icon.replace('./oss/file/', '');
            iconUrl = `${baseURL}/admin/oss/file/${fileId}`;
          } else if (app.icon.includes('/admin/oss/file/')) {
            // Handle path containing /admin/oss/file/
            iconUrl = app.icon.startsWith('http') ? app.icon : `${baseURL}${app.icon}`;
          } else if (app.icon.startsWith('./')) {
            // Handle other relative paths like "./favicon.ico"
            // These are default icons, treat as empty (will show fallback)
            iconUrl = '';
          } else if (app.icon.includes('.')) {
            // Likely a filename like favicon.ico, treat as empty (will show fallback)
            iconUrl = '';
          } else {
            // Assume it is a file ID (UUID), construct the full URL
            // Format: ${baseURL}/admin/oss/file/{id}
            iconUrl = `${baseURL}/admin/oss/file/${app.icon}`;
          }
          console.log(`Processed icon for app ${app.name}: ${app.icon} -> ${iconUrl}`);
        } else if (app.icon_file_id) {
          // Handle case where icon is stored in icon_file_id field
          iconUrl = `${baseURL}/admin/oss/file/${app.icon_file_id}`;
          console.log(`Processed icon from icon_file_id for app ${app.name}: ${app.icon_file_id} -> ${iconUrl}`);
        }

        // Get access_token for the application
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

    // Save to JSON file
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
    // If file doesn't exist, return empty array
    return [];
  }
};

/**
 * 本地服务器入口文件，用于本地开发
 */
import dotenv from 'dotenv';
// 确保在最开始加载环境变量
const result = dotenv.config();
console.log('Env loaded:', result.parsed ? Object.keys(result.parsed) : 'No env vars');

import app from './app.js';

/**
 * 使用指定端口启动服务器
 */
const PORT = process.env.PORT || 3001;

// 打印 CAS 配置确认
console.log('CAS_SERVER_URL:', process.env.CAS_SERVER_URL);
console.log('CAS_SERVICE_URL:', process.env.CAS_SERVICE_URL);

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * 关闭服务器
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

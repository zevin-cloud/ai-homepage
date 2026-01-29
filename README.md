# AI 助手门户

一个基于 Vue 3 + Express 的 AI 助手聚合门户，支持从 MaxKB 自动同步 AI 助手数据。

![Vue](https://img.shields.io/badge/Vue-3.4.15-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat&logo=express)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-06B6D4?style=flat&logo=tailwindcss)

## 功能特性

- 美观的现代化 UI 设计，支持响应式布局
- 从 MaxKB 自动同步 AI 助手数据
- 分类展示 AI 助手，支持下拉菜单快速访问
- 沉浸式聊天界面，支持全屏模式
- 支持拖拽滚动浏览
- 一键数据同步功能

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vue Router
- Tailwind CSS
- Lucide Vue Next（图标库）

### 后端
- Express.js
- TypeScript
- Axios
- CORS

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env` 文件：

```env
# 服务器端口
PORT=3001

# MaxKB 配置
MAXKB_API_KEY=your_api_key
MAXKB_BASE_URL=https://your-maxkb-instance.com
MAXKB_ROOT_FOLDER=Portal
MAXKB_WORKSPACE_ID=default
```

### 开发模式

同时启动前端和后端：

```bash
pnpm run dev
```

前端运行在 http://localhost:5173
后端运行在 http://localhost:3001

### 生产构建

```bash
pnpm run build
```

## 部署

### Docker 部署（推荐）

```bash
chmod +x deploy.sh
./deploy.sh docker
```

### 手动部署

```bash
chmod +x deploy.sh
./deploy.sh manual
```

详细部署说明请参考 [DEPLOY.md](./DEPLOY.md)

## 项目结构

```
ai-homepage/
├── api/                    # 后端 API
│   ├── routes/            # 路由
│   │   ├── auth.ts        # 认证路由
│   │   └── maxkb.ts       # MaxKB 同步路由
│   ├── services/          # 服务层
│   │   └── maxkb.ts       # MaxKB 数据同步服务
│   ├── app.ts             # Express 应用配置
│   ├── server.ts          # 服务器入口
│   └── index.ts           # Vercel 入口
├── src/                   # 前端源码
│   ├── components/        # Vue 组件
│   │   ├── Header.vue     # 顶部导航
│   │   ├── AssistantCard.vue  # 助手卡片
│   │   ├── FeatureTiles.vue   # 功能区块
│   │   └── Footer.vue     # 底部组件
│   ├── pages/             # 页面
│   │   └── HomePage.vue   # 首页
│   ├── router/            # 路由配置
│   ├── data/              # 数据类型定义
│   └── App.vue            # 根组件
├── Dockerfile             # Docker 配置
├── docker-compose.yml     # Docker Compose 配置
├── deploy.sh              # 部署脚本
└── package.json           # 项目配置
```

## API 接口

### 获取分类列表
```
GET /api/maxkb/categories
```

### 手动触发同步
```
POST /api/maxkb/sync
```

### 健康检查
```
GET /api/health
```

## 截图

![首页](.figma/image/screenshot_7_83.png)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Vue.js](https://vuejs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MaxKB](https://github.com/1Panel-dev/MaxKB)

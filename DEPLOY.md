# AI Homepage Linux 部署指南

本文档提供两种部署方式：**Docker 部署（推荐）** 和 **手动部署**。

## 方式一：Docker 部署（推荐）

### 前置要求
- Docker >= 20.10
- Docker Compose >= 2.0

### 快速部署

```bash
# 1. 进入项目目录
cd /path/to/ai-homepage

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh docker
```

### 常用命令

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

### 配置说明

- 服务默认运行在 `3001` 端口
- 环境变量从 `.env` 文件读取
- 容器会自动重启（除非手动停止）

---

## 方式二：手动部署

### 前置要求
- Node.js >= 18
- pnpm >= 8
- PM2（可选，但推荐用于进程管理）

### 快速部署

```bash
# 1. 进入项目目录
cd /path/to/ai-homepage

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh manual
```

### 手动步骤（如果不使用脚本）

```bash
# 1. 安装依赖
pnpm install --frozen-lockfile

# 2. 构建项目
pnpm run build

# 3. 安装生产依赖
pnpm install --frozen-lockfile --prod

# 4. 使用 PM2 启动
pm2 start api/server.js --name ai-homepage --env production
pm2 save
pm2 startup
```

### PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs ai-homepage

# 重启
pm2 restart ai-homepage

# 停止
pm2 stop ai-homepage

# 删除
pm2 delete ai-homepage
```

---

## 方式三：使用 Nginx 反向代理

如果你需要使用域名访问，建议配合 Nginx 使用。

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. 配置 Nginx

```bash
# 复制配置文件
sudo cp deploy-nginx.conf /etc/nginx/sites-available/ai-homepage

# 修改配置文件中的域名
sudo nano /etc/nginx/sites-available/ai-homepage

# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-homepage /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 3. 配置 HTTPS（可选）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量配置

确保 `.env` 文件包含以下配置：

```env
# 服务器端口
PORT=3001

# 其他 API 密钥等配置
# MAXKB_API_KEY=xxx
# MAXKB_API_URL=xxx
```

---

## 防火墙配置

```bash
# 开放 3001 端口（如果直接使用）
sudo ufw allow 3001/tcp

# 或者只开放 80/443（如果使用 Nginx）
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 故障排查

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>
```

### 2. 权限问题

```bash
# 确保脚本可执行
chmod +x deploy.sh

# 如果使用 80/443 端口，需要 root 权限
sudo ./deploy.sh manual
```

### 3. 查看日志

```bash
# Docker 部署
docker-compose logs -f

# 手动部署
pm2 logs ai-homepage

# 或者查看 Node.js 日志
journalctl -u ai-homepage -f
```

---

## 更新部署

### Docker 方式

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose down
docker-compose up -d --build
```

### 手动方式

```bash
# 拉取最新代码
git pull

# 重新构建
pnpm install --frozen-lockfile
pnpm run build
pnpm install --frozen-lockfile --prod

# 重启服务
pm2 restart ai-homepage
```

---

## 推荐部署流程

1. **开发环境测试** → 使用 `pnpm run dev`
2. **服务器部署** → 使用 `./deploy.sh docker`
3. **生产环境** → Docker + Nginx + HTTPS

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `Dockerfile` | Docker 镜像构建文件 |
| `docker-compose.yml` | Docker Compose 配置 |
| `deploy.sh` | 一键部署脚本 |
| `deploy-nginx.conf` | Nginx 配置示例 |
| `DEPLOY.md` | 部署文档（本文件） |

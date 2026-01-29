# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括 devDependencies）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端
RUN pnpm run build

# 编译后端 TypeScript 到 JavaScript
RUN pnpm exec tsc --project tsconfig.json --outDir dist-server

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制前端构建产物
COPY --from=builder /app/dist ./dist

# 复制编译后的后端代码
COPY --from=builder /app/dist-server ./api

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "api/server.js"]

#!/bin/bash

# AI Homepage 部署脚本
# 使用方法: ./deploy.sh [docker|manual]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# Docker 部署
deploy_docker() {
    log_info "开始使用 Docker 部署..."
    
    check_command docker
    check_command docker-compose
    
    # 停止旧容器
    log_info "停止旧容器..."
    docker-compose down 2>/dev/null || true
    
    # 构建并启动
    log_info "构建 Docker 镜像..."
    docker-compose build --no-cache
    
    log_info "启动容器..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 5
    
    # 检查健康状态
    if docker-compose ps | grep -q "healthy"; then
        log_info "部署成功！服务运行在 http://localhost:3001"
    else
        log_warn "服务可能还在启动中，请稍后检查"
        docker-compose logs --tail=20
    fi
}

# 手动部署
deploy_manual() {
    log_info "开始手动部署..."
    
    check_command node
    check_command pnpm
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本需要 >= 18，当前版本: $(node --version)"
        exit 1
    fi
    
    log_info "Node.js 版本: $(node --version)"
    log_info "pnpm 版本: $(pnpm --version)"
    
    # 安装依赖
    log_info "安装依赖..."
    pnpm install --frozen-lockfile
    
    # 构建项目
    log_info "构建项目..."
    pnpm run build
    
    # 安装生产依赖
    log_info "安装生产依赖..."
    pnpm install --frozen-lockfile --prod
    
    # 使用 PM2 启动（如果安装了 PM2）
    if command -v pm2 &> /dev/null; then
        log_info "使用 PM2 启动服务..."
        pm2 delete ai-homepage 2>/dev/null || true
        pm2 start api/server.js --name ai-homepage --env production
        pm2 save
        log_info "部署成功！服务已用 PM2 启动"
        log_info "查看状态: pm2 status"
        log_info "查看日志: pm2 logs ai-homepage"
    else
        log_warn "PM2 未安装，建议使用 PM2 管理 Node.js 进程"
        log_info "直接启动服务..."
        NODE_ENV=production node api/server.js &
        log_info "服务运行在后台，PID: $!"
    fi
}

# 显示帮助
show_help() {
    cat << EOF
AI Homepage 部署脚本

使用方法:
    ./deploy.sh [docker|manual]

选项:
    docker   使用 Docker 部署（推荐）
    manual   手动部署到服务器
    help     显示此帮助信息

示例:
    ./deploy.sh docker    # Docker 部署
    ./deploy.sh manual    # 手动部署
EOF
}

# 主逻辑
main() {
    case "${1:-docker}" in
        docker)
            deploy_docker
            ;;
        manual)
            deploy_manual
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知的部署方式: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

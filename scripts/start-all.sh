#!/bin/bash

# 同时启动前端和后端的脚本
# 使用方法: ./scripts/start-all.sh

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

echo "🚀 启动贪吃蛇游戏项目..."
echo "项目根目录: $PROJECT_ROOT"
echo ""

# 检查必要的命令
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3 命令"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm 命令"
    exit 1
fi

# 创建必要的目录
mkdir -p scripts/pids
mkdir -p frontend
mkdir -p backend

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  前端依赖未安装，正在安装..."
    cd frontend && npm install && cd .. || exit 1
fi

# 检查后端虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "⚠️  后端虚拟环境未创建，正在创建..."
    cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd .. || exit 1
fi

# 创建前端环境变量（如果不存在）
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 创建前端环境变量文件..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local || exit 1
fi

# 创建后端环境变量（如果不存在）
if [ ! -f "backend/.env" ]; then
    echo "📝 创建后端环境变量文件..."
    cat > backend/.env << EOF
API_HOST=0.0.0.0
API_PORT=8000
MODEL_DIR=./models
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
EOF
fi

echo "✅ 环境检查完成"
echo ""
echo "启动服务..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 启动前端（后台）
echo "🌐 启动前端..."
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev > "$PROJECT_ROOT/scripts/pids/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/scripts/pids/frontend.pid"
cd "$PROJECT_ROOT" || exit 1

# 等待前端启动
sleep 3

# 启动后端
echo "🐍 启动后端..."
cd "$PROJECT_ROOT/backend" || exit 1
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/scripts/pids/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/scripts/pids/backend.pid"
cd "$PROJECT_ROOT" || exit 1

echo ""
echo "✅ 服务已启动！"
echo "前端 PID: $FRONTEND_PID"
echo "后端 PID: $BACKEND_PID"
echo ""
echo "日志文件:"
echo "  前端: scripts/pids/frontend.log"
echo "  后端: scripts/pids/backend.log"
echo ""
echo "停止服务: ./scripts/stop-all.sh"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; cd \"$PROJECT_ROOT\" && ./scripts/stop-all.sh; exit" INT TERM

# 保持脚本运行，等待后台进程
echo "服务运行中，按 Ctrl+C 停止..."
while kill -0 $FRONTEND_PID 2>/dev/null || kill -0 $BACKEND_PID 2>/dev/null; do
    sleep 1
done


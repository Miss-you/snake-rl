#!/bin/bash

# 同时启动前端和后端的脚本
# 使用方法: ./start-all.sh

echo "🚀 启动贪吃蛇游戏项目..."
echo ""

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  前端依赖未安装，正在安装..."
    cd frontend && npm install && cd ..
fi

# 检查后端虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "⚠️  后端虚拟环境未创建，正在创建..."
    cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..
fi

# 创建前端环境变量（如果不存在）
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 创建前端环境变量文件..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
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
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端启动
sleep 3

# 启动后端
echo "🐍 启动后端..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT TERM

# 保持脚本运行
wait


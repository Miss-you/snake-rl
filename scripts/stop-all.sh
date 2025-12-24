#!/bin/bash

# 停止所有服务的脚本
# 使用方法: ./scripts/stop-all.sh

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🛑 停止所有服务..."
echo ""

PID_DIR="scripts/pids"

# 停止前端
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
        # 如果还在运行，强制杀死
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo "✅ 前端服务已停止"
    else
        echo "⚠️  前端服务未运行 (PID: $FRONTEND_PID)"
    fi
    rm -f "$PID_DIR/frontend.pid"
else
    echo "⚠️  未找到前端PID文件"
fi

# 停止后端
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        # 如果还在运行，强制杀死
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo "✅ 后端服务已停止"
    else
        echo "⚠️  后端服务未运行 (PID: $BACKEND_PID)"
    fi
    rm -f "$PID_DIR/backend.pid"
else
    echo "⚠️  未找到后端PID文件"
fi

# 清理可能残留的进程（通过端口查找）
echo ""
echo "检查残留进程..."

# 检查3000端口（前端）
if command -v lsof > /dev/null 2>&1; then
    FRONTEND_PORT=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$FRONTEND_PORT" ]; then
        echo "发现3000端口占用，正在清理..."
        kill $FRONTEND_PORT 2>/dev/null
        sleep 1
        if ps -p $FRONTEND_PORT > /dev/null 2>&1; then
            kill -9 $FRONTEND_PORT 2>/dev/null
        fi
    fi

    # 检查8000端口（后端）
    BACKEND_PORT=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$BACKEND_PORT" ]; then
        echo "发现8000端口占用，正在清理..."
        kill $BACKEND_PORT 2>/dev/null
        sleep 1
        if ps -p $BACKEND_PORT > /dev/null 2>&1; then
            kill -9 $BACKEND_PORT 2>/dev/null
        fi
    fi
else
    echo "⚠️  lsof命令不可用，跳过端口检查"
fi

echo ""
echo "✅ 所有服务已停止"
echo ""


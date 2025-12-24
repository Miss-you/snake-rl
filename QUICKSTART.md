# 快速开始指南

## 🚀 5分钟快速启动

### 步骤1：安装依赖

**前端**：
```bash
cd frontend
npm install
```

**后端**：
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 步骤2：启动服务

**方法1：使用脚本（推荐，最简单）**

```bash
# 启动所有服务
./scripts/start-all.sh

# 停止所有服务（在另一个终端）
./scripts/stop-all.sh
```

**方法2：手动启动（两个终端）**

**终端1 - 启动前端**：
```bash
cd frontend
npm run dev
```
访问：http://localhost:3000

**终端2 - 启动后端**：
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
访问：http://localhost:8000/docs

### 步骤3：开始游戏

1. 打开浏览器访问 http://localhost:3000
2. 点击"开始游戏"按钮
3. 使用方向键或WASD控制蛇的移动
4. 按 `1` 切换到人工控制，按 `2` 切换到AI模式

## ⚠️ 常见问题

### 问题1：前端无法连接后端

**解决**：
1. 确保后端正在运行（访问 http://localhost:8000/docs 验证）
2. 检查 `frontend/.env.local` 文件是否存在，内容为：
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### 问题2：后端启动失败

**解决**：
1. 确保Python版本 >= 3.10：`python --version`
2. 确保虚拟环境已激活
3. 确保所有依赖已安装：`pip install -r requirements.txt`

### 问题3：端口被占用

**解决**：
- 前端：修改 `frontend/package.json` 中的端口，或使用 `npm run dev -- -p 3001`
- 后端：修改 `backend/.env` 中的 `API_PORT=8001`

## 📝 环境变量配置

### 前端环境变量 (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 后端环境变量 (`backend/.env`)

```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_DIR=./models
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
```

## 🎮 游戏控制

- **方向键** 或 **WASD** - 控制蛇的移动
- **空格键** - 开始/重新开始游戏
- **1** - 切换到人工控制模式
- **2** - 切换到AI自动控制模式

## 📚 更多信息

- 详细设置指南：[docs/setup-guide.md](./docs/setup-guide.md)
- 架构设计：[docs/architecture.md](./docs/architecture.md)
- 项目结构：[docs/project-structure.md](./docs/project-structure.md)


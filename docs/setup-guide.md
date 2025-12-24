# 前后端分离架构设置指南

## 项目结构说明

```
snake-demo/
├── app/                    # 前端代码（Next.js应用）
├── components/              # React组件
├── hooks/                   # React Hooks
├── lib/                     # 核心逻辑
│   ├── game/               # 游戏逻辑（前端运行）
│   ├── rendering/          # 渲染逻辑
│   ├── rl/                 # RL相关（状态提取、奖励计算）
│   └── api/                # API客户端（与后端通信）
├── backend/                 # 后端代码（Python项目）
│   ├── app/                # FastAPI应用
│   │   ├── api/           # API路由
│   │   ├── core/          # 核心配置
│   │   ├── models/        # 数据模型
│   │   └── services/      # 业务逻辑
│   └── models/            # 训练好的模型存储
└── docs/                    # 文档
```

## 为什么这样组织？

### 1. 前后端代码分离但同仓库

**优点**：
- ✅ 便于版本控制（一个仓库）
- ✅ 便于部署（可以分别部署）
- ✅ 代码清晰，职责分明

**替代方案**：
- 如果项目很大，可以拆分为两个独立仓库
- 使用 monorepo 工具（如 Turborepo）

### 2. 前端保留游戏逻辑

**原因**：
- 游戏需要在浏览器中实时运行
- 用户交互需要前端处理
- 渲染必须在浏览器完成

**后端的作用**：
- 训练RL模型
- 模型推理（可选，也可以前端推理）
- 经验数据存储和管理

### 3. 共享代码的处理

**当前方案**：
- 状态提取和奖励计算在前端（因为需要实时计算）
- 训练逻辑在后端（需要GPU和大量计算）

**如果代码量大，可以考虑**：
- 使用共享类型定义（TypeScript ↔ Python）
- 使用代码生成工具
- 使用 Protocol Buffers

## 设置步骤

### 步骤1：克隆/下载项目

```bash
git clone <your-repo>
cd snake-demo
```

### 步骤2：设置前端

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 NEXT_PUBLIC_API_URL=http://localhost:8000

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:3000 运行

### 步骤3：设置后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env（通常默认值即可）

# 启动后端服务
# macOS/Linux:
./start.sh
# Windows:
start.bat
# 或手动:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 http://localhost:8000 运行

### 步骤4：验证连接

1. 打开浏览器访问 http://localhost:3000
2. 打开开发者工具（F12）→ Network标签
3. 启动游戏，观察是否有API请求
4. 访问 http://localhost:8000/docs 查看API文档

## 开发工作流

### 前端开发

```bash
# 前端目录（根目录）
npm run dev          # 开发模式
npm run build        # 构建
npm run start        # 生产模式
```

### 后端开发

```bash
# 后端目录
cd backend
source venv/bin/activate  # 激活虚拟环境
uvicorn app.main:app --reload  # 开发模式（自动重载）
```

### 同时运行前后端

**方案1：使用脚本（推荐）**
```bash
# 启动所有服务
./scripts/start-all.sh

# 停止所有服务（在另一个终端）
./scripts/stop-all.sh
```

**方案2：两个终端窗口**
- 终端1：运行前端 `cd frontend && npm run dev`
- 终端2：运行后端 `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`

## 常见问题

### Q1: 前端无法连接到后端？

**检查**：
1. 后端是否运行？访问 http://localhost:8000/docs
2. `.env` 文件中的 `NEXT_PUBLIC_API_URL` 是否正确？
3. CORS配置是否正确？（后端 `CORS_ORIGINS`）

### Q2: 后端启动失败？

**检查**：
1. Python版本（需要3.10+）
2. 虚拟环境是否激活？
3. 依赖是否安装完整？`pip install -r requirements.txt`

### Q3: 如何部署？

**前端部署**：
- Vercel（推荐）：连接GitHub，自动部署
- Netlify：类似Vercel
- 自建服务器：`npm run build && npm start`

**后端部署**：
- Docker：创建Dockerfile，部署到云服务器
- 云服务：AWS/GCP/Azure的容器服务
- 自建服务器：使用systemd或supervisor管理进程

### Q4: 如何调试？

**前端调试**：
- 浏览器开发者工具
- React DevTools
- Next.js的调试模式

**后端调试**：
- FastAPI自动生成的Swagger UI（/docs）
- Python调试器（pdb）
- 日志输出

## 下一步

1. ✅ 完成前后端设置
2. ⬜ 测试API连接
3. ⬜ 实现经验收集和提交
4. ⬜ 实现模型训练
5. ⬜ 实现模型推理


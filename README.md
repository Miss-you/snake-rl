# 贪吃蛇游戏 - Next.js + TypeScript + Python

一个使用 Next.js 14、TypeScript 和 Python 构建的前后端分离的贪吃蛇游戏，支持强化学习训练。

## 项目结构

```
snake-demo/
├── frontend/              # 前端项目（Next.js + TypeScript）
│   ├── app/              # Next.js App Router
│   ├── components/      # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 核心逻辑库
│   │   ├── game/        # 游戏逻辑模块
│   │   ├── rendering/   # 渲染模块
│   │   ├── rl/          # RL相关（状态提取、奖励计算）
│   │   └── api/         # API客户端
│   └── package.json
│
├── backend/              # 后端项目（Python + FastAPI）
│   ├── app/              # FastAPI应用
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   └── services/    # 业务逻辑
│   ├── models/          # 训练好的模型存储
│   └── requirements.txt
│
└── docs/                 # 文档
    ├── architecture.md   # 架构设计文档
    └── ...
```

## 快速开始

### 1. 前端设置

```bash
# 进入前端目录
cd frontend  # 如果前端代码在根目录，则跳过此步骤

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 NEXT_PUBLIC_API_URL

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:3000 运行

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动后端服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 http://localhost:8000 运行

### 3. API文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 架构说明

### 前后端分离架构

- **前端**：负责游戏运行、UI渲染、经验收集
- **后端**：负责RL模型训练、模型存储、API服务

详细架构设计请参考 [docs/architecture.md](./docs/architecture.md)

### API端点

- `POST /api/experience` - 提交经验数据
- `GET /api/experience/count` - 获取经验数量
- `POST /api/predict` - 预测动作（推理）
- `POST /api/train` - 开始训练
- `GET /api/train/status` - 获取训练状态
- `GET /api/model/latest` - 获取最新模型

## 特性

- ✅ **TypeScript** - 完整的类型安全
- ✅ **模块化设计** - 清晰的代码组织，便于维护
- ✅ **Next.js 14** - 使用最新的 App Router
- ✅ **FastAPI** - 高性能的Python Web框架
- ✅ **前后端分离** - 清晰的职责划分
- ✅ **RL训练支持** - 支持强化学习模型训练
- ✅ **AI 模式** - 智能贪吃蛇 AI，支持尾部可达性检查
- ✅ **人工控制** - 支持方向键和 WASD 控制
- ✅ **现代化 UI** - 深色主题，流畅动画

## 游戏控制

- **方向键** 或 **WASD** - 控制蛇的移动方向
- **空格键** - 开始/重新开始游戏
- **1** - 切换到人工控制模式
- **2** - 切换到 AI 自动控制模式

## 强化学习（Reinforcement Learning）

项目已准备好强化学习的基础设施！

### 已实现的功能

- ✅ **状态提取器** (`lib/rl/stateExtractor.ts`) - 将游戏状态转换为特征向量
- ✅ **奖励计算器** (`lib/rl/rewardCalculator.ts`) - 根据游戏事件计算奖励
- ✅ **Q-Learning算法** (`lib/rl/qLearning.ts`) - 基础的强化学习算法实现
- ✅ **API客户端** (`lib/api/client.ts`) - 与后端通信
- ✅ **经验收集器** (`lib/api/experienceCollector.ts`) - 收集并发送经验
- ✅ **RL Agent** (`lib/api/rlAgent.ts`) - 使用后端模型推理

### 学习资源

- 📖 [强化学习学习指南](./docs/reinforcement-learning.md) - 详细的理论和实践指南
- 📖 [RL常见问题解答](./docs/rl-faq.md) - 解答常见问题
- 📖 [RL实施计划](./docs/rl-implementation-plan.md) - 分阶段实施路线图
- 📖 [架构设计文档](./docs/architecture.md) - 前后端分离架构说明

## 开发计划

- [x] 前后端分离架构
- [x] API接口定义
- [x] 经验收集和提交
- [x] 模型推理接口
- [ ] 实现DQN训练服务
- [ ] 训练可视化界面
- [ ] 模型版本管理
- [ ] 添加游戏难度选择
- [ ] 添加排行榜功能

## 技术栈

### 前端
- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Canvas API** - 游戏渲染
- **React Hooks** - 状态管理

### 后端
- **FastAPI** - Python Web框架
- **PyTorch** - 深度学习框架
- **Pydantic** - 数据验证
- **Uvicorn** - ASGI服务器

## 许可证

MIT

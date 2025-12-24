# 前后端分离架构设计

## 项目结构

```
snake-demo/
├── frontend/              # 前端项目（Next.js + TypeScript）
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── game/         # 游戏逻辑（前端运行）
│   │   ├── rendering/    # 渲染逻辑
│   │   ├── rl/           # RL相关（状态提取、奖励计算）
│   │   └── api/          # API客户端
│   └── package.json
│
├── backend/              # 后端项目（Python + FastAPI）
│   ├── app/
│   │   ├── api/          # API路由
│   │   ├── core/         # 核心配置
│   │   ├── models/       # 数据模型
│   │   ├── services/     # 业务逻辑
│   │   │   ├── game/     # 游戏模拟器
│   │   │   └── rl/       # RL训练服务
│   │   └── main.py       # FastAPI入口
│   ├── models/           # 训练好的模型存储
│   ├── requirements.txt
│   └── README.md
│
├── shared/               # 共享类型定义（可选）
│   └── types/            # TypeScript和Python共享的类型
│
└── docs/                 # 文档
```

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Game Engine  │  │ RL Client    │  │ UI Components │ │
│  │ - 游戏逻辑    │  │ - 状态提取   │  │ - 游戏画面   │ │
│  │ - 渲染        │  │ - 经验收集   │  │ - 训练监控   │ │
│  │ - 用户输入    │  │ - API调用    │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘ │
│         │                 │                            │
│         └─────────────────┴────────────────────────────┘
│                          │ HTTP/WebSocket
│                          │ JSON
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  Backend (Python/FastAPI)                │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ API Layer    │  │ RL Service   │  │ Game Simulator│ │
│  │ - REST API   │  │ - DQN/PPO    │  │ - 无UI游戏    │ │
│  │ - WebSocket  │  │ - 训练循环    │  │ - 快速运行    │ │
│  │ - 模型服务   │  │ - 模型管理    │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘ │
│         │                 │                            │
│         └─────────────────┴────────────────────────────┘
│                          │
│  ┌───────────────────────▼────────────────────────────┐ │
│  │              Model Storage                          │ │
│  │  - PyTorch模型文件                                  │ │
│  │  - 训练检查点                                       │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## API 设计

### REST API 端点

#### 1. 经验提交
```
POST /api/experience
Body: {
  "experiences": [
    {
      "state": [0.5, 0.3, ...],
      "action": 0,
      "reward": 0.1,
      "nextState": [0.6, 0.3, ...],
      "done": false
    }
  ]
}
Response: {
  "success": true,
  "count": 10
}
```

#### 2. 获取模型
```
GET /api/model/latest
Response: {
  "model": {
    "weights": {...},  // 模型权重（base64编码或URL）
    "version": "1.0.0",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. 开始训练
```
POST /api/train
Body: {
  "episodes": 1000,
  "config": {...}
}
Response: {
  "success": true,
  "trainingId": "train_123"
}
```

#### 4. 训练状态
```
GET /api/train/status
Response: {
  "isTraining": true,
  "currentEpisode": 500,
  "averageScore": 15.5,
  "maxScore": 25
}
```

#### 5. 预测动作（推理）
```
POST /api/predict
Body: {
  "state": [0.5, 0.3, ...]
}
Response: {
  "action": 2,
  "qValues": [0.1, 0.2, 0.5, 0.1]
}
```

### WebSocket（可选，用于实时训练监控）

```
WS /ws/training
Messages:
  - {"type": "stats", "data": {...}}
  - {"type": "episode_complete", "data": {...}}
```

## 数据流

### 训练流程

```
1. 前端运行游戏
   ↓
2. 收集经验 (state, action, reward, nextState)
   ↓
3. 每N步发送经验到后端 (POST /api/experience)
   ↓
4. 后端存储到经验回放缓冲区
   ↓
5. 后端定期训练模型（或手动触发）
   ↓
6. 前端定期获取最新模型 (GET /api/model/latest)
   ↓
7. 前端加载模型，继续游戏
   ↓
8. 重复步骤1-7
```

### 推理流程（使用训练好的模型）

```
1. 前端提取当前状态
   ↓
2. 发送状态到后端 (POST /api/predict)
   ↓
3. 后端返回动作
   ↓
4. 前端执行动作
   ↓
5. 重复步骤1-4
```

## 技术栈

### 前端
- **框架**: Next.js 14
- **语言**: TypeScript
- **HTTP客户端**: fetch API 或 axios
- **WebSocket**: native WebSocket API

### 后端
- **框架**: FastAPI
- **语言**: Python 3.10+
- **RL库**: PyTorch + stable-baselines3（可选）
- **数据库**: SQLite（存储训练历史）或 Redis（经验缓冲区）
- **模型存储**: 文件系统或云存储

## 环境配置

### 前端环境变量
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 后端环境变量
```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_DIR=./models
LOG_LEVEL=info
```

## 部署建议

### 开发环境
- 前端：`npm run dev` (localhost:3000)
- 后端：`uvicorn app.main:app --reload` (localhost:8000)

### 生产环境
- 前端：Vercel / Netlify
- 后端：Docker + 云服务器（AWS/GCP/Azure）
- 模型存储：云存储（S3/GCS）

## 安全考虑

1. **API认证**：使用JWT token（如果需要）
2. **CORS配置**：限制允许的前端域名
3. **速率限制**：防止API滥用
4. **数据验证**：使用Pydantic验证输入数据


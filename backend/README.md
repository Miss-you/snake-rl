# 贪吃蛇 RL 训练后端

Python + FastAPI + PyTorch 实现的强化学习训练服务。

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI应用入口
│   ├── api/                 # API路由
│   │   ├── __init__.py
│   │   ├── routes.py        # API端点定义
│   │   └── websocket.py     # WebSocket端点（可选）
│   ├── core/                # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py        # 配置管理
│   │   └── security.py      # 安全相关（可选）
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── experience.py    # 经验数据模型
│   │   └── training.py      # 训练配置模型
│   ├── services/            # 业务逻辑
│   │   ├── __init__.py
│   │   ├── game/            # 游戏模拟器
│   │   │   ├── __init__.py
│   │   │   ├── simulator.py # 游戏模拟器（无UI）
│   │   │   └── state.py     # 状态提取
│   │   └── rl/              # RL训练服务
│   │       ├── __init__.py
│   │       ├── dqn.py       # DQN实现
│   │       ├── trainer.py   # 训练器
│   │       └── replay_buffer.py  # 经验回放缓冲区
│   └── utils/               # 工具函数
│       ├── __init__.py
│       └── logger.py        # 日志工具
├── models/                  # 训练好的模型存储
│   └── .gitkeep
├── requirements.txt         # Python依赖
├── .env.example            # 环境变量示例
└── README.md
```

## 安装

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

## 运行

```bash
# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 环境变量

复制 `.env.example` 到 `.env` 并配置：

```env
API_HOST=0.0.0.0
API_PORT=8000
MODEL_DIR=./models
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
```


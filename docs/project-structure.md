# 项目代码结构说明

## 为什么这样组织代码？

### 1. 前后端分离但同仓库

**当前结构**：
```
snake-demo/
├── app/              # 前端代码（Next.js）
├── lib/              # 前端逻辑库
├── backend/          # 后端代码（Python）
└── docs/             # 文档
```

**优点**：
- ✅ 一个仓库管理，便于版本控制
- ✅ 前后端可以独立开发和部署
- ✅ 代码清晰，职责分明

**何时拆分**：
- 如果项目很大，可以拆分为两个独立仓库
- 如果团队很大，可以独立管理
- 如果部署方式不同，可以分开

### 2. 前端保留游戏逻辑的原因

**为什么游戏逻辑在前端？**
- 游戏需要在浏览器中实时运行
- 用户交互需要前端处理
- Canvas渲染必须在浏览器完成
- 低延迟要求（不能等待网络请求）

**后端的作用**：
- ✅ RL模型训练（需要GPU，计算密集）
- ✅ 模型推理（可选，也可以前端推理）
- ✅ 经验数据存储和管理
- ✅ 训练状态监控

### 3. 代码组织原则

#### 前端代码组织（TypeScript/Next.js）

```
app/                    # Next.js App Router（页面）
components/            # React组件（UI）
hooks/                 # 自定义Hooks（状态管理）
lib/                   # 核心逻辑库
├── game/             # 游戏逻辑（纯函数，无副作用）
├── rendering/        # 渲染逻辑（Canvas相关）
├── rl/               # RL相关（状态提取、奖励计算）
└── api/              # API客户端（与后端通信）
```

**原则**：
- 按功能模块划分
- 每个模块职责单一
- 便于测试和维护

#### 后端代码组织（Python/FastAPI）

```
app/
├── main.py           # 应用入口
├── api/              # API路由（接口定义）
├── core/             # 核心配置（设置、安全）
├── models/           # 数据模型（Pydantic模型）
└── services/         # 业务逻辑（游戏模拟器、RL训练）
```

**原则**：
- 分层架构（API → Service → Model）
- 依赖注入
- 便于测试和扩展

## 代码结构详解

### 前端结构

#### `lib/game/` - 游戏逻辑
- **职责**：游戏核心逻辑，无UI依赖
- **特点**：纯函数，易于测试
- **文件**：
  - `types.ts` - 类型定义
  - `config.ts` - 游戏配置
  - `gameState.ts` - 状态管理
  - `snake.ts` - 蛇的逻辑
  - `food.ts` - 食物的逻辑
  - `collision.ts` - 碰撞检测
  - `ai.ts` - 简单AI（规则基础）

#### `lib/rendering/` - 渲染逻辑
- **职责**：Canvas绘制
- **特点**：与游戏逻辑分离
- **文件**：
  - `renderer.ts` - Canvas渲染器

#### `lib/rl/` - RL相关
- **职责**：状态提取、奖励计算
- **特点**：可以在前后端共享逻辑
- **文件**：
  - `stateExtractor.ts` - 状态提取
  - `rewardCalculator.ts` - 奖励计算
  - `qLearning.ts` - Q-Learning算法（前端训练用）
  - `types.ts` - RL类型定义
  - `config.ts` - RL配置

#### `lib/api/` - API客户端
- **职责**：与后端通信
- **特点**：封装HTTP请求
- **文件**：
  - `client.ts` - API客户端
  - `experienceCollector.ts` - 经验收集器
  - `rlAgent.ts` - RL Agent（使用后端模型）

### 后端结构

#### `app/api/` - API路由
- **职责**：定义HTTP端点
- **特点**：薄层，只做请求/响应处理
- **文件**：
  - `routes.py` - REST API端点

#### `app/models/` - 数据模型
- **职责**：数据验证和序列化
- **特点**：使用Pydantic
- **文件**：
  - `experience.py` - 经验数据模型
  - `training.py` - 训练配置模型
  - `prediction.py` - 预测请求/响应模型

#### `app/services/` - 业务逻辑
- **职责**：核心业务逻辑
- **特点**：可独立测试
- **文件**：
  - `rl/replay_buffer.py` - 经验回放缓冲区
  - `rl/dqn.py` - DQN实现（待实现）
  - `rl/trainer.py` - 训练器（待实现）
  - `game/simulator.py` - 游戏模拟器（待实现）

#### `app/core/` - 核心配置
- **职责**：应用配置
- **文件**：
  - `config.py` - 配置管理

## 数据流

### 训练流程

```
前端游戏运行
  ↓
收集经验 (state, action, reward, nextState)
  ↓
经验收集器缓冲
  ↓
批量发送到后端 (POST /api/experience)
  ↓
后端存储到经验回放缓冲区
  ↓
后端训练模型（定期或手动触发）
  ↓
前端获取最新模型 (GET /api/model/latest)
  ↓
前端加载模型，继续游戏
```

### 推理流程

```
前端提取状态
  ↓
发送到后端 (POST /api/predict)
  ↓
后端模型推理
  ↓
返回动作
  ↓
前端执行动作
```

## 共享代码处理

### 当前方案

**状态提取和奖励计算**：
- 在前端实现（需要实时计算）
- 后端可以有自己的实现（用于游戏模拟器）

**类型定义**：
- 前端：TypeScript类型
- 后端：Pydantic模型
- 保持一致性（手动维护）

### 改进方案（可选）

**如果代码量大，可以考虑**：

1. **共享类型定义**
   - 使用JSON Schema
   - 代码生成工具

2. **Protocol Buffers**
   - 定义.proto文件
   - 生成TypeScript和Python代码

3. **OpenAPI/Swagger**
   - 定义API规范
   - 生成客户端代码

## 最佳实践

### 1. 代码组织

✅ **DO**：
- 按功能模块划分
- 保持模块独立性
- 清晰的命名

❌ **DON'T**：
- 不要过度拆分
- 不要循环依赖
- 不要混用前后端代码

### 2. API设计

✅ **DO**：
- RESTful API设计
- 清晰的端点命名
- 统一的错误处理

❌ **DON'T**：
- 不要暴露内部实现
- 不要忽略错误处理
- 不要忘记CORS配置

### 3. 类型安全

✅ **DO**：
- TypeScript类型定义
- Pydantic数据验证
- 保持前后端类型一致

❌ **DON'T**：
- 不要使用any类型
- 不要忽略类型检查

## 扩展建议

### 如果项目变大

1. **拆分前端**
   - 使用monorepo（Turborepo）
   - 按功能拆分包

2. **拆分后端**
   - 微服务架构
   - 独立的训练服务

3. **添加共享包**
   - 类型定义包
   - 工具函数包

### 如果团队变大

1. **代码规范**
   - ESLint/Prettier（前端）
   - Black/Flake8（后端）
   - Pre-commit hooks

2. **文档**
   - API文档（Swagger）
   - 代码注释
   - 架构文档

3. **测试**
   - 单元测试
   - 集成测试
   - E2E测试


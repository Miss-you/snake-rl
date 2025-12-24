# RL架构重构总结

## 变更概述

根据要求，已将强化学习的训练逻辑从前端移除，改为：
- **训练逻辑**：完全在Python后端实现
- **推理逻辑**：前端只负责调用后端API进行推理
- **经验收集**：前端收集经验并发送到后端

## 主要变更

### 1. 前端变更

#### ✅ 新增文件

- `hooks/useRLInference.ts` - RL推理Hook（替代useRLTraining）
  - 只负责调用后端API进行推理
  - 不包含任何训练逻辑
  - 从后端获取训练状态

- `components/RLInferencePanel.tsx` - RL推理面板（替代RLTrainingPanel）
  - 显示推理状态
  - 显示后端训练状态
  - 不显示Q表大小等训练相关指标

#### ❌ 移除/废弃的文件

- `hooks/useRLTraining.ts` - **已废弃**（包含训练逻辑）
  - 可以保留作为参考，但不应该使用
  - 训练逻辑应该在后端实现

- `lib/rl/qLearning.ts` - **保留但不应使用**
  - 可以保留作为学习参考
  - 不应该在前端实际使用

#### 🔄 修改的文件

- `hooks/useGame.ts`
  - 移除：`useRLTraining` 的使用
  - 新增：`useRLInference` 的使用
  - 新增：`ExperienceCollector` 用于收集经验
  - 修改：RL模式改为推理模式，只调用后端API

- `app/page.tsx`
  - 移除：`RLTrainingPanel` 的使用
  - 新增：`RLInferencePanel` 的使用

- `components/Toolbar.tsx`
  - 更新：模式显示文本（RL训练 → RL推理）

### 2. 后端状态

#### ✅ 已有基础设施

- `app/services/rl/replay_buffer.py` - 经验回放缓冲区 ✅
- `app/api/routes.py` - API接口定义 ✅
  - `POST /api/experience` - 接收经验 ✅
  - `POST /api/predict` - 推理接口（占位符）
  - `POST /api/train` - 训练接口（占位符）
  - `GET /api/train/status` - 训练状态 ✅

#### ⬜ 待实现

- `app/services/rl/dqn.py` - DQN实现
- `app/services/rl/trainer.py` - 训练器
- `app/services/rl/model_manager.py` - 模型管理
- 完善 `POST /api/predict` 的实际推理逻辑
- 完善 `POST /api/train` 的实际训练逻辑

## 架构对比

### 之前（错误）

```
前端：
├── Q-Learning实现 ❌
├── Q表更新 ❌
├── 训练循环 ❌
└── 推理 ✅

后端：
├── 经验接收 ✅
└── 训练逻辑 ⬜（未实现）
```

### 现在（正确）

```
前端：
├── 经验收集 ✅
├── 调用后端API推理 ✅
└── 不包含训练逻辑 ✅

后端：
├── 经验接收 ✅
├── 经验回放缓冲区 ✅
├── 训练逻辑 ⬜（待实现）
└── 模型推理 ⬜（待实现）
```

## 使用方式

### 前端使用（推理）

```typescript
// 使用RL推理Hook
const { rlInference } = useGame();

// 切换到RL模式
handleSetControlMode('rl');

// 自动开始推理（调用后端API）
// 经验会自动收集并发送到后端
```

### 后端使用（训练）

```python
# 1. 接收经验
POST /api/experience
{
  "experiences": [...]
}

# 2. 开始训练
POST /api/train
{
  "episodes": 1000
}

# 3. 获取训练状态
GET /api/train/status

# 4. 推理（前端调用）
POST /api/predict
{
  "state": [0.5, 0.3, ...]
}
```

## 注意事项

### ⚠️ 重要提醒

1. **前端不再训练**：
   - `qLearning.ts` 可以保留作为学习参考
   - 但不要在前端实际使用训练逻辑

2. **后端必须运行**：
   - RL推理模式需要后端API支持
   - 如果后端不可用，会回退到简单规则

3. **经验收集**：
   - 前端会自动收集经验并发送到后端
   - 每50条经验批量发送一次

4. **训练在后端**：
   - 所有训练逻辑应该在Python后端实现
   - 使用PyTorch/TensorFlow等框架

## 下一步

1. ⬜ 实现后端DQN训练逻辑
2. ⬜ 实现模型保存和加载
3. ⬜ 完善推理API
4. ⬜ 添加训练监控

## 相关文档

- [RL架构说明](./rl-architecture.md) - 详细的架构设计
- [强化学习指南](./reinforcement-learning.md) - RL学习指南
- [架构设计](./architecture.md) - 整体架构设计


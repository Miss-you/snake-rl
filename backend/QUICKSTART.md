# 后端快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

服务启动后访问：
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/api/health

### 3. 测试游戏模拟器

```bash
python test_simulator.py
```

### 4. 开始训练

#### 方法1：使用API文档（推荐）

1. 打开 http://localhost:8000/docs
2. 找到 `POST /api/train` 接口
3. 点击 "Try it out"
4. 输入训练参数：
```json
{
  "episodes": 100,
  "config": {
    "learningRate": 0.001,
    "batchSize": 64,
    "epsilonStart": 1.0,
    "epsilonEnd": 0.01,
    "epsilonDecay": 0.995,
    "gamma": 0.9
  }
}
```
5. 点击 "Execute"

#### 方法2：使用curl

```bash
curl -X POST "http://localhost:8000/api/train" \
  -H "Content-Type: application/json" \
  -d '{
    "episodes": 100,
    "config": {
      "learningRate": 0.001,
      "batchSize": 64,
      "epsilonStart": 1.0,
      "epsilonEnd": 0.01,
      "epsilonDecay": 0.995,
      "gamma": 0.9
    }
  }'
```

### 5. 查询训练状态

```bash
curl "http://localhost:8000/api/train/status"
```

### 6. 使用模型推理

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "state": [0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 1]
  }'
```

## 📝 训练参数说明

### 快速测试（100 episodes）
- 适合快速验证功能
- 训练时间：约1-2分钟

### 标准训练（1000 episodes）
- 适合获得基本性能
- 训练时间：约10-20分钟

### 完整训练（10000 episodes）
- 适合获得最佳性能
- 训练时间：约2-4小时

## 🔍 监控训练

训练过程中可以：
1. 查看控制台输出（每10个episode打印一次）
2. 调用 `/api/train/status` 查询状态
3. 查看 `backend/models/` 目录中的模型文件

## 💡 提示

- 训练是异步的，不会阻塞API
- 训练完成后模型会自动保存
- 如果没有GPU，训练会在CPU上运行（较慢）
- 首次推理会自动加载最新模型

## 🐛 常见问题

### Q: 训练没有开始？
A: 检查是否有其他训练正在进行，一次只能运行一个训练任务。

### Q: 推理返回随机动作？
A: 确保已经训练过模型，或者有训练好的模型文件在 `backend/models/` 目录。

### Q: 训练很慢？
A: 这是正常的，DQN训练需要时间。可以先用少量episodes测试。


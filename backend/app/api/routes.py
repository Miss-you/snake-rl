"""
API路由定义
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
from app.models.experience import ExperienceBatch, ExperienceResponse
from app.models.training import TrainingRequest, TrainingStatus, TrainingResponse
from app.models.prediction import PredictionRequest, PredictionResponse
from app.services.rl.replay_buffer import ReplayBuffer
from app.core.config import settings

router = APIRouter()

# 全局经验回放缓冲区
replay_buffer = ReplayBuffer(capacity=settings.TRAINING_MEMORY_SIZE)

# 训练状态（简化版，实际应该用数据库或Redis）
training_status = TrainingStatus(
    isTraining=False,
    currentEpisode=0,
    totalEpisodes=0,
    averageScore=0.0,
    maxScore=0,
    epsilon=1.0
)


@router.post("/experience", response_model=ExperienceResponse)
async def submit_experience(batch: ExperienceBatch):
    """
    提交经验数据
    
    前端运行游戏时收集的经验会通过此接口提交到后端
    """
    try:
        replay_buffer.push_batch(batch.experiences)
        return ExperienceResponse(
            success=True,
            count=len(batch.experiences),
            message=f"成功存储 {len(batch.experiences)} 条经验"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/experience/count")
async def get_experience_count():
    """获取当前经验数量"""
    return {
        "count": len(replay_buffer),
        "capacity": replay_buffer.capacity,
        "isReady": replay_buffer.is_ready(settings.TRAINING_BATCH_SIZE)
    }


@router.post("/train", response_model=TrainingResponse)
async def start_training(request: TrainingRequest, background_tasks: BackgroundTasks):
    """
    开始训练
    
    注意：这是一个简化版本，实际应该使用任务队列（如Celery）
    """
    if training_status.isTraining:
        raise HTTPException(status_code=400, detail="训练正在进行中")
    
    # TODO: 实现实际的训练逻辑
    # background_tasks.add_task(train_model, request)
    
    training_status.isTraining = True
    training_status.totalEpisodes = request.episodes
    
    return TrainingResponse(
        success=True,
        trainingId="train_001",
        message="训练已开始"
    )


@router.get("/train/status", response_model=TrainingStatus)
async def get_training_status():
    """获取训练状态"""
    return training_status


@router.post("/predict", response_model=PredictionResponse)
async def predict_action(request: PredictionRequest):
    """
    预测动作（推理）
    
    使用训练好的模型预测下一步动作
    """
    # TODO: 加载模型并进行推理
    # 这里返回一个示例响应
    
    if len(request.state) != 11:
        raise HTTPException(
            status_code=400,
            detail=f"状态向量维度错误，期望11维，实际{len(request.state)}维"
        )
    
    # 示例：简单的规则（实际应该使用训练好的模型）
    # 这里应该加载模型并推理
    import random
    action = random.randint(0, 3)
    q_values = [0.25, 0.25, 0.25, 0.25]
    
    return PredictionResponse(
        action=action,
        qValues=q_values,
        confidence=0.5
    )


@router.get("/model/latest")
async def get_latest_model():
    """获取最新模型"""
    # TODO: 从文件系统或数据库加载模型信息
    return {
        "version": "1.0.0",
        "createdAt": "2024-01-01T00:00:00Z",
        "downloadUrl": "/api/model/download/latest",
        "metadata": {
            "averageScore": 15.5,
            "maxScore": 25,
            "episodes": 1000
        }
    }


@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "replayBufferSize": len(replay_buffer)
    }


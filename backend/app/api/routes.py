"""
API路由定义
"""

import asyncio
import numpy as np
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
from app.models.experience import ExperienceBatch, ExperienceResponse
from app.models.training import TrainingRequest, TrainingStatus, TrainingResponse
from app.models.prediction import PredictionRequest, PredictionResponse
from app.services.rl.replay_buffer import ReplayBuffer
from app.services.rl.trainer import Trainer
from app.services.rl.dqn import DQNAgent
from app.services.rl.model_manager import ModelManager
from app.core.config import settings

router = APIRouter()

# 全局经验回放缓冲区
replay_buffer = ReplayBuffer(capacity=settings.TRAINING_MEMORY_SIZE)

# 全局训练器
trainer: Optional[Trainer] = None

# 全局推理智能体（用于预测）
inference_agent: Optional[DQNAgent] = None

# 模型管理器
model_manager = ModelManager()

# 训练状态
training_status = TrainingStatus(
    isTraining=False,
    currentEpisode=0,
    totalEpisodes=0,
    averageScore=0.0,
    maxScore=0,
    epsilon=1.0
)


def update_training_status(status_dict: dict):
    """更新训练状态的回调函数"""
    global training_status
    training_status.isTraining = status_dict.get('isTraining', True)
    training_status.currentEpisode = status_dict.get('episode', 0)
    training_status.averageScore = status_dict.get('average_score', 0.0)
    training_status.maxScore = status_dict.get('max_score', 0)
    training_status.epsilon = status_dict.get('epsilon', 1.0)
    training_status.currentLoss = status_dict.get('loss')


def get_or_create_inference_agent() -> DQNAgent:
    """获取或创建推理智能体"""
    global inference_agent
    if inference_agent is None:
        inference_agent = DQNAgent(
            state_size=11,
            action_size=4,
            learning_rate=settings.TRAINING_LEARNING_RATE,
            gamma=settings.TRAINING_GAMMA,
            epsilon=0.0,  # 推理时不探索
            epsilon_min=0.0,
            epsilon_decay=1.0
        )
        # 尝试加载最新模型
        model_manager.load_latest_model(inference_agent)
    return inference_agent


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
    global trainer
    
    if training_status.isTraining:
        raise HTTPException(status_code=400, detail="训练正在进行中")
    
    # 创建训练器
    config = request.config
    trainer = Trainer(
        replay_buffer=replay_buffer,
        config=config,
        on_update=update_training_status
    )
    
    # 在后台任务中运行训练
    background_tasks.add_task(train_model_task, trainer, request.episodes)
    
    training_status.isTraining = True
    training_status.totalEpisodes = request.episodes
    
    return TrainingResponse(
        success=True,
        trainingId="train_001",
        message="训练已开始"
    )


async def train_model_task(trainer_instance: Trainer, episodes: int):
    """训练任务（后台运行）"""
    try:
        await trainer_instance.train(episodes)
        
        # 训练完成后保存模型
        if trainer_instance.episode_scores:
            metadata = {
                'averageScore': float(np.mean(trainer_instance.episode_scores)),
                'maxScore': int(max(trainer_instance.episode_scores)),
                'episodes': episodes,
                'finalEpsilon': float(trainer_instance.agent.epsilon),
            }
            model_path = model_manager.save_model(trainer_instance.agent, metadata)
            print(f"模型已保存: {model_path}")
    except Exception as e:
        print(f"训练出错: {e}")
    finally:
        global training_status
        training_status.isTraining = False


@router.get("/train/status", response_model=TrainingStatus)
async def get_training_status():
    """获取训练状态"""
    global trainer
    if trainer:
        # 从训练器获取最新状态
        status = trainer.get_status()
        update_training_status(status)
    return training_status


@router.post("/predict", response_model=PredictionResponse)
async def predict_action(request: PredictionRequest):
    """
    预测动作（推理）
    
    使用训练好的模型预测下一步动作
    """
    if len(request.state) != 11:
        raise HTTPException(
            status_code=400,
            detail=f"状态向量维度错误，期望11维，实际{len(request.state)}维"
        )
    
    try:
        # 获取推理智能体
        agent = get_or_create_inference_agent()
        
        # 转换为numpy数组
        state_array = np.array(request.state)
        
        # 获取Q值
        q_values = agent.get_q_values(state_array)
        
        # 选择动作（Q值最大的）
        action = int(np.argmax(q_values))
        
        # 计算置信度（Q值的归一化）
        max_q = max(q_values)
        min_q = min(q_values)
        confidence = (max_q - min_q) / (max_q - min_q + 1e-8) if max_q != min_q else 0.5
        
        return PredictionResponse(
            action=action,
            qValues=q_values,
            confidence=float(confidence)
        )
    except Exception as e:
        # 如果出错，回退到随机动作
        import random
        action = random.randint(0, 3)
        q_values = [0.25, 0.25, 0.25, 0.25]
        return PredictionResponse(
            action=action,
            qValues=q_values,
            confidence=0.1
        )


@router.get("/model/latest")
async def get_latest_model():
    """获取最新模型"""
    model_info = model_manager.get_latest_model_info()
    if model_info is None:
        raise HTTPException(status_code=404, detail="未找到训练好的模型")
    return model_info


@router.post("/model/reload")
async def reload_model():
    """重新加载最新模型"""
    global inference_agent
    inference_agent = None
    get_or_create_inference_agent()
    return {"success": True, "message": "模型已重新加载"}


@router.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "replayBufferSize": len(replay_buffer)
    }


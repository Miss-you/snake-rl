"""
训练相关模型
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TrainingConfig(BaseModel):
    """训练配置"""
    learningRate: float = Field(0.001, ge=0.0001, le=1.0)
    batchSize: int = Field(64, ge=1, le=512)
    hiddenLayers: List[int] = Field(default=[128, 128])
    epsilonStart: float = Field(1.0, ge=0.0, le=1.0)
    epsilonEnd: float = Field(0.01, ge=0.0, le=1.0)
    epsilonDecay: float = Field(0.995, ge=0.9, le=1.0)
    gamma: float = Field(0.9, ge=0.0, le=1.0)
    memorySize: int = Field(10000, ge=1000)
    updateTargetEvery: int = Field(100, ge=10)


class TrainingRequest(BaseModel):
    """训练请求"""
    episodes: int = Field(1000, ge=1, le=100000)
    config: Optional[TrainingConfig] = None


class TrainingStatus(BaseModel):
    """训练状态"""
    isTraining: bool
    currentEpisode: int = 0
    totalEpisodes: int = 0
    averageScore: float = 0.0
    maxScore: int = 0
    currentLoss: Optional[float] = None
    epsilon: float = 1.0


class TrainingResponse(BaseModel):
    """训练响应"""
    success: bool
    trainingId: Optional[str] = None
    message: str = ""


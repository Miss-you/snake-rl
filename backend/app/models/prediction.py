"""
预测相关模型
"""

from typing import List
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """预测请求"""
    state: List[float] = Field(..., description="状态向量（11维）")


class PredictionResponse(BaseModel):
    """预测响应"""
    action: int = Field(..., ge=0, le=3, description="推荐动作（0-3）")
    qValues: List[float] = Field(..., description="各动作的Q值")
    confidence: float = Field(..., description="置信度")


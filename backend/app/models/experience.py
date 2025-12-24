"""
经验数据模型
"""

from typing import List
from pydantic import BaseModel, Field


class Experience(BaseModel):
    """单条经验"""
    state: List[float] = Field(..., description="当前状态向量")
    action: int = Field(..., ge=0, le=3, description="动作索引（0-3）")
    reward: float = Field(..., description="奖励值")
    nextState: List[float] = Field(..., description="下一状态向量")
    done: bool = Field(..., description="是否结束")


class ExperienceBatch(BaseModel):
    """经验批次"""
    experiences: List[Experience] = Field(..., description="经验列表")


class ExperienceResponse(BaseModel):
    """经验提交响应"""
    success: bool
    count: int = Field(..., description="成功存储的经验数量")
    message: str = ""


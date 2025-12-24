"""
应用配置管理
"""

import os
from pathlib import Path
from typing import List

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # 兼容旧版本的pydantic
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    
    # API配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_TITLE: str = "Snake RL Training API"
    API_VERSION: str = "1.0.0"
    
    # 模型配置
    MODEL_DIR: Path = Path("./models")
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # 日志配置
    LOG_LEVEL: str = "info"
    
    # 训练配置
    TRAINING_BATCH_SIZE: int = 64
    TRAINING_LEARNING_RATE: float = 0.001
    TRAINING_GAMMA: float = 0.9
    TRAINING_MEMORY_SIZE: int = 10000
    TRAINING_UPDATE_TARGET_EVERY: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()

# 确保模型目录存在
settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)


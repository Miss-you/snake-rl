"""
模型管理器：负责模型的保存和加载
"""

import os
from pathlib import Path
from typing import Optional
from datetime import datetime
from app.services.rl.dqn import DQNAgent
from app.core.config import settings


class ModelManager:
    """模型管理器"""
    
    def __init__(self, model_dir: Optional[Path] = None):
        """
        初始化模型管理器
        
        Args:
            model_dir: 模型存储目录
        """
        self.model_dir = model_dir or settings.MODEL_DIR
        self.model_dir.mkdir(parents=True, exist_ok=True)
    
    def save_model(self, agent: DQNAgent, metadata: Optional[dict] = None) -> str:
        """
        保存模型
        
        Args:
            agent: DQN智能体
            metadata: 元数据（如训练统计信息）
        
        Returns:
            模型文件路径
        """
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"snake_dqn_{timestamp}.pth"
        filepath = self.model_dir / filename
        
        # 保存模型
        agent.save(str(filepath))
        
        # 保存元数据（如果有）
        if metadata:
            import json
            metadata_file = filepath.with_suffix('.json')
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        return str(filepath)
    
    def load_latest_model(self, agent: DQNAgent) -> Optional[str]:
        """
        加载最新的模型
        
        Args:
            agent: DQN智能体（用于加载权重）
        
        Returns:
            模型文件路径，如果不存在则返回None
        """
        # 查找所有模型文件
        model_files = list(self.model_dir.glob("snake_dqn_*.pth"))
        
        if not model_files:
            return None
        
        # 按修改时间排序，获取最新的
        latest_model = max(model_files, key=lambda p: p.stat().st_mtime)
        
        # 加载模型
        agent.load(str(latest_model))
        
        return str(latest_model)
    
    def get_latest_model_info(self) -> Optional[dict]:
        """
        获取最新模型的信息
        
        Returns:
            模型信息字典，如果不存在则返回None
        """
        # 查找所有模型文件
        model_files = list(self.model_dir.glob("snake_dqn_*.pth"))
        
        if not model_files:
            return None
        
        # 按修改时间排序，获取最新的
        latest_model = max(model_files, key=lambda p: p.stat().st_mtime)
        
        # 获取文件信息
        stat = latest_model.stat()
        created_at = datetime.fromtimestamp(stat.st_mtime).isoformat()
        
        # 尝试加载元数据
        metadata_file = latest_model.with_suffix('.json')
        metadata = {}
        if metadata_file.exists():
            import json
            try:
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
            except:
                pass
        
        return {
            'version': latest_model.stem,
            'createdAt': created_at,
            'downloadUrl': f"/api/model/download/latest",
            'filepath': str(latest_model),
            'metadata': metadata,
        }
    
    def list_models(self) -> list:
        """
        列出所有模型
        
        Returns:
            模型信息列表
        """
        model_files = list(self.model_dir.glob("snake_dqn_*.pth"))
        
        models = []
        for model_file in sorted(model_files, key=lambda p: p.stat().st_mtime, reverse=True):
            stat = model_file.stat()
            created_at = datetime.fromtimestamp(stat.st_mtime).isoformat()
            
            # 尝试加载元数据
            metadata_file = model_file.with_suffix('.json')
            metadata = {}
            if metadata_file.exists():
                import json
                try:
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                except:
                    pass
            
            models.append({
                'filename': model_file.name,
                'createdAt': created_at,
                'filepath': str(model_file),
                'metadata': metadata,
            })
        
        return models


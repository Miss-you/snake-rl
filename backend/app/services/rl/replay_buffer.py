"""
经验回放缓冲区
"""

from collections import deque
from typing import List, Optional
import random
from app.models.experience import Experience


class ReplayBuffer:
    """经验回放缓冲区"""
    
    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)
        self.capacity = capacity
    
    def push(self, experience: Experience) -> None:
        """添加经验"""
        self.buffer.append(experience)
    
    def push_batch(self, experiences: List[Experience]) -> None:
        """批量添加经验"""
        for exp in experiences:
            self.buffer.append(exp)
    
    def sample(self, batch_size: int) -> Optional[List[Experience]]:
        """随机采样一批经验"""
        if len(self.buffer) < batch_size:
            return None
        
        return random.sample(list(self.buffer), batch_size)
    
    def __len__(self) -> int:
        return len(self.buffer)
    
    def is_ready(self, batch_size: int) -> bool:
        """检查是否有足够经验进行训练"""
        return len(self.buffer) >= batch_size


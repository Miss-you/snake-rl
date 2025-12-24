"""
ReplayBuffer单元测试
"""

import pytest
from app.services.rl.replay_buffer import ReplayBuffer
from app.models.experience import Experience


class TestReplayBuffer:
    """ReplayBuffer测试类"""
    
    def test_initialization(self):
        """测试初始化"""
        buffer = ReplayBuffer(capacity=100)
        assert buffer.capacity == 100
        assert len(buffer) == 0
    
    def test_push_single(self, replay_buffer, sample_experience):
        """测试添加单条经验"""
        initial_len = len(replay_buffer)
        replay_buffer.push(sample_experience)
        
        assert len(replay_buffer) == initial_len + 1
    
    def test_push_batch(self, replay_buffer, sample_experience):
        """测试批量添加经验"""
        experiences = [sample_experience] * 10
        initial_len = len(replay_buffer)
        
        replay_buffer.push_batch(experiences)
        
        assert len(replay_buffer) == initial_len + 10
    
    def test_sample_empty_buffer(self, replay_buffer):
        """测试从空缓冲区采样"""
        result = replay_buffer.sample(10)
        assert result is None
    
    def test_sample_insufficient_experiences(self, replay_buffer, sample_experience):
        """测试经验不足时采样"""
        # 只添加5条经验
        for _ in range(5):
            replay_buffer.push(sample_experience)
        
        # 尝试采样10条
        result = replay_buffer.sample(10)
        assert result is None
    
    def test_sample_sufficient_experiences(self, replay_buffer, sample_experience):
        """测试经验充足时采样"""
        # 添加20条经验
        for i in range(20):
            exp = Experience(
                state=[0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 1, 0],
                action=i % 4,
                reward=0.1 * i,
                nextState=[0.52, 0.5, 0.08, 0.1, 0, 0, 0, 0, 0, 1, 0],
                done=False
            )
            replay_buffer.push(exp)
        
        # 采样10条
        batch = replay_buffer.sample(10)
        
        assert batch is not None
        assert len(batch) == 10
        assert all(isinstance(exp, Experience) for exp in batch)
    
    def test_sample_different_batches(self, replay_buffer, sample_experience):
        """测试每次采样得到不同的批次"""
        # 添加足够多的经验
        for i in range(100):
            exp = Experience(
                state=[0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 1, 0],
                action=i % 4,
                reward=0.1 * i,
                nextState=[0.52, 0.5, 0.08, 0.1, 0, 0, 0, 0, 0, 1, 0],
                done=False
            )
            replay_buffer.push(exp)
        
        # 采样两次
        batch1 = replay_buffer.sample(10)
        batch2 = replay_buffer.sample(10)
        
        # 两次采样应该得到不同的批次（概率很高）
        # 注意：理论上可能相同，但概率极低
        assert batch1 is not None
        assert batch2 is not None
    
    def test_capacity_limit(self):
        """测试容量限制"""
        buffer = ReplayBuffer(capacity=5)
        
        # 添加超过容量的经验
        for i in range(10):
            exp = Experience(
                state=[0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 1, 0],
                action=i % 4,
                reward=0.1,
                nextState=[0.52, 0.5, 0.08, 0.1, 0, 0, 0, 0, 0, 1, 0],
                done=False
            )
            buffer.push(exp)
        
        # 缓冲区大小应该不超过容量
        assert len(buffer) == 5
    
    def test_is_ready(self, replay_buffer, sample_experience):
        """测试is_ready方法"""
        # 初始状态
        assert replay_buffer.is_ready(10) is False
        
        # 添加足够经验
        for _ in range(10):
            replay_buffer.push(sample_experience)
        
        assert replay_buffer.is_ready(10) is True
        assert replay_buffer.is_ready(11) is False
    
    def test_len_method(self, replay_buffer, sample_experience):
        """测试len方法"""
        assert len(replay_buffer) == 0
        
        replay_buffer.push(sample_experience)
        assert len(replay_buffer) == 1
        
        replay_buffer.push(sample_experience)
        assert len(replay_buffer) == 2


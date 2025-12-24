"""
DQN (Deep Q-Network) 实现
使用PyTorch
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import List, Optional
import random


class DQN(nn.Module):
    """深度Q网络"""
    
    def __init__(self, state_size: int = 11, action_size: int = 4, hidden_layers: List[int] = [128, 128]):
        """
        初始化DQN
        
        Args:
            state_size: 状态向量维度（11）
            action_size: 动作数量（4）
            hidden_layers: 隐藏层大小列表
        """
        super(DQN, self).__init__()
        
        layers = []
        input_size = state_size
        
        # 构建隐藏层
        for hidden_size in hidden_layers:
            layers.append(nn.Linear(input_size, hidden_size))
            layers.append(nn.ReLU())
            input_size = hidden_size
        
        # 输出层
        layers.append(nn.Linear(input_size, action_size))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """前向传播"""
        return self.network(state)


class DQNAgent:
    """DQN智能体"""
    
    def __init__(
        self,
        state_size: int = 11,
        action_size: int = 4,
        learning_rate: float = 0.001,
        gamma: float = 0.9,
        epsilon: float = 1.0,
        epsilon_min: float = 0.01,
        epsilon_decay: float = 0.995,
        hidden_layers: List[int] = [128, 128],
        device: Optional[str] = None
    ):
        """
        初始化DQN智能体
        
        Args:
            state_size: 状态向量维度
            action_size: 动作数量
            learning_rate: 学习率
            gamma: 折扣因子
            epsilon: 初始探索率
            epsilon_min: 最小探索率
            epsilon_decay: 探索率衰减
            hidden_layers: 隐藏层配置
            device: 设备（'cuda' 或 'cpu'）
        """
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        
        # 设备选择
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 主网络和目标网络
        self.q_network = DQN(state_size, action_size, hidden_layers).to(self.device)
        self.target_network = DQN(state_size, action_size, hidden_layers).to(self.device)
        
        # 优化器
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        # 更新目标网络
        self.update_target_network()
    
    def update_target_network(self):
        """将主网络的权重复制到目标网络"""
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def select_action(self, state: np.ndarray, training: bool = True) -> int:
        """
        选择动作（ε-贪婪策略）
        
        Args:
            state: 状态向量
            training: 是否在训练模式（影响探索）
        
        Returns:
            动作索引
        """
        if training and random.random() < self.epsilon:
            # 随机探索
            return random.randrange(self.action_size)
        
        # 利用：选择Q值最大的动作
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            return q_values.cpu().data.numpy().argmax()
    
    def train_step(self, batch: List[tuple]) -> float:
        """
        训练一步
        
        Args:
            batch: 经验批次，每个元素为 (state, action, reward, next_state, done)
        
        Returns:
            损失值
        """
        # 分离批次数据
        states = torch.FloatTensor([e[0] for e in batch]).to(self.device)
        actions = torch.LongTensor([e[1] for e in batch]).to(self.device)
        rewards = torch.FloatTensor([e[2] for e in batch]).to(self.device)
        next_states = torch.FloatTensor([e[3] for e in batch]).to(self.device)
        dones = torch.BoolTensor([e[4] for e in batch]).to(self.device)
        
        # 当前Q值
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        
        # 目标Q值（使用目标网络）
        with torch.no_grad():
            next_q_values = self.target_network(next_states).max(1)[0]
            target_q_values = rewards + (self.gamma * next_q_values * ~dones)
        
        # 计算损失
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
        
        # 反向传播
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def decay_epsilon(self):
        """衰减探索率"""
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
    
    def get_q_values(self, state: np.ndarray) -> List[float]:
        """
        获取所有动作的Q值
        
        Args:
            state: 状态向量
        
        Returns:
            Q值列表
        """
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            return q_values.cpu().data.numpy()[0].tolist()
    
    def save(self, filepath: str):
        """保存模型"""
        torch.save({
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
        }, filepath)
    
    def load(self, filepath: str):
        """加载模型"""
        checkpoint = torch.load(filepath, map_location=self.device)
        self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
        self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.epsilon = checkpoint.get('epsilon', self.epsilon_min)


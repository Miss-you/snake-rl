"""
DQN单元测试
"""

import pytest
import numpy as np
import torch
from app.services.rl.dqn import DQN, DQNAgent


class TestDQN:
    """DQN网络测试类"""
    
    def test_dqn_initialization(self):
        """测试DQN初始化"""
        dqn = DQN(state_size=11, action_size=4)
        
        assert dqn is not None
        assert isinstance(dqn, DQN)
    
    def test_dqn_forward(self):
        """测试DQN前向传播"""
        dqn = DQN(state_size=11, action_size=4)
        
        # 创建测试输入
        state = torch.randn(1, 11)
        
        # 前向传播
        output = dqn(state)
        
        assert output.shape == (1, 4)  # batch_size=1, action_size=4
    
    def test_dqn_batch_forward(self):
        """测试批量前向传播"""
        dqn = DQN(state_size=11, action_size=4)
        
        # 创建批量输入
        batch_size = 32
        state = torch.randn(batch_size, 11)
        
        output = dqn(state)
        
        assert output.shape == (batch_size, 4)
    
    def test_dqn_custom_hidden_layers(self):
        """测试自定义隐藏层"""
        dqn = DQN(state_size=11, action_size=4, hidden_layers=[64, 32, 16])
        
        state = torch.randn(1, 11)
        output = dqn(state)
        
        assert output.shape == (1, 4)


class TestDQNAgent:
    """DQNAgent测试类"""
    
    def test_agent_initialization(self):
        """测试智能体初始化"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            learning_rate=0.001
        )
        
        assert agent.state_size == 11
        assert agent.action_size == 4
        assert agent.learning_rate == 0.001
        assert agent.epsilon == 1.0
    
    def test_select_action_exploration(self):
        """测试探索模式下的动作选择"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=1.0  # 完全探索
        )
        
        state = np.random.rand(11)
        
        # 在完全探索模式下，应该随机选择动作
        actions = []
        for _ in range(20):
            action = agent.select_action(state, training=True)
            actions.append(action)
            assert 0 <= action < 4
        
        # 应该有不同的动作（概率很高）
        assert len(set(actions)) > 1
    
    def test_select_action_exploitation(self):
        """测试利用模式下的动作选择"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=0.0  # 不探索
        )
        
        state = np.random.rand(11)
        
        # 在完全利用模式下，应该选择Q值最大的动作
        action = agent.select_action(state, training=False)
        
        assert 0 <= action < 4
    
    def test_select_action_training_mode(self):
        """测试训练模式"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=0.5
        )
        
        state = np.random.rand(11)
        
        # 训练模式下可能探索也可能利用
        action = agent.select_action(state, training=True)
        assert 0 <= action < 4
    
    def test_train_step(self):
        """测试训练步骤"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            learning_rate=0.001
        )
        
        # 创建批次数据
        batch = []
        for i in range(32):
            batch.append((
                np.random.rand(11).tolist(),  # state
                np.random.randint(0, 4),      # action
                np.random.randn(),            # reward
                np.random.rand(11).tolist(),  # next_state
                False                         # done
            ))
        
        # 执行训练步骤
        loss = agent.train_step(batch)
        
        assert isinstance(loss, float)
        assert loss >= 0
    
    def test_decay_epsilon(self):
        """测试探索率衰减"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=1.0,
            epsilon_decay=0.9,
            epsilon_min=0.1
        )
        
        initial_epsilon = agent.epsilon
        agent.decay_epsilon()
        
        assert agent.epsilon < initial_epsilon
        assert agent.epsilon == 1.0 * 0.9
    
    def test_decay_epsilon_min(self):
        """测试探索率不会低于最小值"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=0.15,
            epsilon_decay=0.9,
            epsilon_min=0.1
        )
        
        # 衰减后应该不会低于最小值
        agent.decay_epsilon()
        assert agent.epsilon >= agent.epsilon_min
        
        # 继续衰减
        agent.decay_epsilon()
        assert agent.epsilon >= agent.epsilon_min
    
    def test_get_q_values(self):
        """测试获取Q值"""
        agent = DQNAgent(
            state_size=11,
            action_size=4
        )
        
        state = np.random.rand(11)
        q_values = agent.get_q_values(state)
        
        assert len(q_values) == 4
        assert all(isinstance(q, (int, float)) for q in q_values)
    
    def test_update_target_network(self):
        """测试更新目标网络"""
        agent = DQNAgent(
            state_size=11,
            action_size=4
        )
        
        # 训练主网络
        batch = [(
            np.random.rand(11).tolist(),
            np.random.randint(0, 4),
            np.random.randn(),
            np.random.rand(11).tolist(),
            False
        ) for _ in range(10)]
        
        agent.train_step(batch)
        
        # 更新目标网络
        agent.update_target_network()
        
        # 目标网络应该与主网络有相同的权重
        # 通过检查输出是否相同来验证
        state = np.random.rand(11)
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(agent.device)
        
        q_main = agent.q_network(state_tensor)
        q_target = agent.target_network(state_tensor)
        
        # 由于权重相同，输出应该相同
        assert torch.allclose(q_main, q_target, atol=1e-6)
    
    def test_save_and_load(self, tmp_path):
        """测试保存和加载模型"""
        agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=0.5
        )
        
        # 训练一下
        batch = [(
            np.random.rand(11).tolist(),
            np.random.randint(0, 4),
            np.random.randn(),
            np.random.rand(11).tolist(),
            False
        ) for _ in range(10)]
        agent.train_step(batch)
        
        # 保存模型
        model_path = tmp_path / "test_model.pth"
        agent.save(str(model_path))
        
        assert model_path.exists()
        
        # 创建新智能体并加载
        new_agent = DQNAgent(
            state_size=11,
            action_size=4,
            epsilon=1.0  # 不同的epsilon
        )
        
        new_agent.load(str(model_path))
        
        # 验证Q值相同（说明权重已加载）
        state = np.random.rand(11)
        q1 = agent.get_q_values(state)
        q2 = new_agent.get_q_values(state)
        
        assert np.allclose(q1, q2, atol=1e-5)
        
        # epsilon应该被加载
        assert new_agent.epsilon == 0.5
    
    def test_device_selection(self):
        """测试设备选择"""
        agent = DQNAgent(
            state_size=11,
            action_size=4
        )
        
        # 应该自动选择设备
        assert agent.device in ['cpu', 'cuda']
        
        # 如果指定设备
        agent_cpu = DQNAgent(
            state_size=11,
            action_size=4,
            device='cpu'
        )
        assert agent_cpu.device == 'cpu'


"""
RL训练器：使用DQN训练贪吃蛇AI
"""

import asyncio
import numpy as np
from typing import Optional, Callable
from app.services.game.simulator import GameSimulator
from app.services.game.state import extract_state
from app.services.rl.dqn import DQNAgent
from app.services.rl.replay_buffer import ReplayBuffer
from app.models.training import TrainingConfig


class Trainer:
    """RL训练器"""
    
    def __init__(
        self,
        replay_buffer: ReplayBuffer,
        config: Optional[TrainingConfig] = None,
        on_update: Optional[Callable] = None
    ):
        """
        初始化训练器
        
        Args:
            replay_buffer: 经验回放缓冲区
            config: 训练配置
            on_update: 更新回调函数（用于更新训练状态）
        """
        self.replay_buffer = replay_buffer
        self.config = config or TrainingConfig()
        self.on_update = on_update
        
        # 创建游戏模拟器
        self.simulator = GameSimulator()
        
        # 创建DQN智能体
        self.agent = DQNAgent(
            state_size=11,
            action_size=4,
            learning_rate=self.config.learningRate,
            gamma=self.config.gamma,
            epsilon=self.config.epsilonStart,
            epsilon_min=self.config.epsilonEnd,
            epsilon_decay=self.config.epsilonDecay,
            hidden_layers=self.config.hiddenLayers
        )
        
        # 训练状态
        self.is_training = False
        self.current_episode = 0
        self.total_episodes = 0
        self.episode_scores = []
        self.current_loss = None
        self.steps_since_target_update = 0
    
    async def train(self, episodes: int):
        """
        开始训练
        
        Args:
            episodes: 训练轮数
        """
        self.is_training = True
        self.total_episodes = episodes
        self.current_episode = 0
        self.episode_scores = []
        self.steps_since_target_update = 0
        
        try:
            for episode in range(episodes):
                if not self.is_training:
                    break
                
                self.current_episode = episode + 1
                
                # 运行一个episode
                score, steps = await self._run_episode()
                
                # 记录分数
                self.episode_scores.append(score)
                if len(self.episode_scores) > 100:
                    self.episode_scores.pop(0)
                
                # 更新回调
                if self.on_update:
                    self.on_update({
                        'episode': self.current_episode,
                        'score': score,
                        'steps': steps,
                        'average_score': np.mean(self.episode_scores) if self.episode_scores else 0,
                        'max_score': max(self.episode_scores) if self.episode_scores else 0,
                        'epsilon': self.agent.epsilon,
                        'loss': self.current_loss,
                    })
                
                # 衰减探索率
                self.agent.decay_epsilon()
                
                # 每10个episode打印一次
                if (episode + 1) % 10 == 0:
                    avg_score = np.mean(self.episode_scores[-10:])
                    print(f"Episode {episode + 1}/{episodes}, Score: {score}, Avg Score: {avg_score:.2f}, Epsilon: {self.agent.epsilon:.3f}")
        
        finally:
            self.is_training = False
    
    async def _run_episode(self) -> tuple[int, int]:
        """
        运行一个episode
        
        Returns:
            (分数, 步数)
        """
        # 重置游戏
        state = self.simulator.reset()
        state_vector = np.array(extract_state(
            state,
            grid_cols=self.simulator.config.grid_cols,
            grid_rows=self.simulator.config.grid_rows
        ))
        
        total_reward = 0
        steps = 0
        
        while not state.game_over:
            # 选择动作
            action = self.agent.select_action(state_vector, training=True)
            
            # 执行动作
            next_state, reward, done = self.simulator.step(action)
            next_state_vector = np.array(extract_state(
                next_state,
                grid_cols=self.simulator.config.grid_cols,
                grid_rows=self.simulator.config.grid_rows
            ))
            
            # 存储经验
            from app.models.experience import Experience
            experience = Experience(
                state=state_vector.tolist(),
                action=action,
                reward=reward,
                nextState=next_state_vector.tolist(),
                done=done
            )
            self.replay_buffer.push(experience)
            
            # 训练（如果有足够的经验）
            if len(self.replay_buffer) >= self.config.batchSize:
                batch = self.replay_buffer.sample(self.config.batchSize)
                if batch:
                    experiences = [(e.state, e.action, e.reward, e.nextState, e.done) for e in batch]
                    loss = self.agent.train_step(experiences)
                    self.current_loss = loss
                    
                    # 更新目标网络
                    self.steps_since_target_update += 1
                    if self.steps_since_target_update >= self.config.updateTargetEvery:
                        self.agent.update_target_network()
                        self.steps_since_target_update = 0
            
            # 更新状态
            state = next_state
            state_vector = next_state_vector
            total_reward += reward
            steps += 1
        
        return state.score, steps
    
    def stop(self):
        """停止训练"""
        self.is_training = False
    
    def get_status(self) -> dict:
        """获取训练状态"""
        return {
            'isTraining': self.is_training,
            'currentEpisode': self.current_episode,
            'totalEpisodes': self.total_episodes,
            'averageScore': float(np.mean(self.episode_scores)) if self.episode_scores else 0.0,
            'maxScore': int(max(self.episode_scores)) if self.episode_scores else 0,
            'currentLoss': float(self.current_loss) if self.current_loss is not None else None,
            'epsilon': float(self.agent.epsilon),
        }


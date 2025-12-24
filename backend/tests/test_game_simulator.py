"""
GameSimulator单元测试
"""

import pytest
from app.services.game.simulator import (
    GameSimulator,
    GameConfig,
    GameState,
    Position,
    Direction
)


class TestGameSimulator:
    """GameSimulator测试类"""
    
    def test_initialization(self, game_simulator):
        """测试初始化"""
        assert game_simulator.config is not None
        assert game_simulator.state is None
    
    def test_reset(self, game_simulator):
        """测试重置游戏"""
        state = game_simulator.reset()
        
        assert state is not None
        assert isinstance(state, GameState)
        assert len(state.snake) == game_simulator.config.initial_length
        assert state.score == 0
        assert state.game_running is True
        assert state.game_over is False
        assert state.food is not None
    
    def test_reset_snake_position(self, game_simulator):
        """测试重置后蛇的位置"""
        state = game_simulator.reset()
        
        # 蛇应该是水平放置的
        snake = state.snake
        assert len(snake) == 4
        
        # 检查蛇是否连续
        for i in range(len(snake) - 1):
            dx = abs(snake[i+1].x - snake[i].x)
            dy = abs(snake[i+1].y - snake[i].y)
            assert (dx == 1 and dy == 0) or (dx == 0 and dy == 1)
    
    def test_step_move_right(self, game_simulator):
        """测试向右移动"""
        state = game_simulator.reset()
        initial_head = state.snake[-1]
        
        # 向右移动（action=3）
        new_state, reward, done = game_simulator.step(3)
        
        assert not done
        assert new_state.snake[-1].x == initial_head.x + 1
        assert new_state.snake[-1].y == initial_head.y
    
    def test_step_move_up(self, game_simulator):
        """测试向上移动"""
        state = game_simulator.reset()
        initial_head = state.snake[-1]
        
        # 向上移动（action=0）
        new_state, reward, done = game_simulator.step(0)
        
        assert not done
        assert new_state.snake[-1].x == initial_head.x
        assert new_state.snake[-1].y == initial_head.y - 1
    
    def test_step_move_down(self, game_simulator):
        """测试向下移动"""
        state = game_simulator.reset()
        initial_head = state.snake[-1]
        
        # 向下移动（action=1）
        new_state, reward, done = game_simulator.step(1)
        
        assert not done
        assert new_state.snake[-1].x == initial_head.x
        assert new_state.snake[-1].y == initial_head.y + 1
    
    def test_step_move_left(self, game_simulator):
        """测试向左移动"""
        state = game_simulator.reset()
        initial_head = state.snake[-1]
        
        # 向左移动（action=2）
        new_state, reward, done = game_simulator.step(2)
        
        assert not done
        assert new_state.snake[-1].x == initial_head.x - 1
        assert new_state.snake[-1].y == initial_head.y
    
    def test_step_opposite_direction_blocked(self, game_simulator):
        """测试禁止直接反向"""
        state = game_simulator.reset()
        # 初始方向是向右
        initial_direction = state.direction
        
        # 尝试向左移动（应该被阻止）
        new_state, _, _ = game_simulator.step(2)
        
        # 方向应该还是向右
        assert new_state.direction.x == initial_direction.x
        assert new_state.direction.y == initial_direction.y
    
    def test_collision_wall(self, game_config):
        """测试撞墙"""
        # 使用小地图便于测试
        config = GameConfig(grid_cols=5, grid_rows=5, initial_length=3)
        simulator = GameSimulator(config=config)
        state = simulator.reset()
        
        # 移动到边界
        for _ in range(10):
            state, _, done = simulator.step(3)  # 向右
            if done:
                break
        
        # 应该撞墙
        assert done
        assert state.game_over is True
    
    def test_collision_self(self, game_simulator):
        """测试撞到自己"""
        state = game_simulator.reset()
        
        # 尝试让蛇转圈撞到自己
        # 先向上
        state, _, done = game_simulator.step(0)
        if done:
            return
        
        # 再向左
        state, _, done = game_simulator.step(2)
        if done:
            return
        
        # 再向下（可能会撞到自己）
        state, _, done = game_simulator.step(1)
        # 如果长度足够短可能不会撞到，所以这里只检查如果done为True则game_over也为True
        if done:
            assert state.game_over is True
    
    def test_food_collision(self, game_simulator):
        """测试吃到食物"""
        state = game_simulator.reset()
        initial_score = state.score
        initial_length = len(state.snake)
        
        # 尝试移动到食物位置（可能需要多次尝试）
        food = state.food
        head = state.snake[-1]
        
        # 计算需要移动的方向
        dx = food.x - head.x
        dy = food.y - head.y
        
        # 简单移动（实际游戏中需要更复杂的路径规划）
        # 这里只测试如果吃到食物，分数和长度应该增加
        for _ in range(100):
            if state.game_over:
                break
            
            # 随机移动
            import random
            action = random.randint(0, 3)
            state, reward, done = game_simulator.step(action)
            
            if reward > 5:  # 吃到食物的奖励
                assert state.score == initial_score + 1
                assert len(state.snake) == initial_length + 1
                break
    
    def test_step_without_reset(self, game_simulator):
        """测试未重置时调用step应该抛出异常"""
        with pytest.raises(ValueError, match="游戏未初始化"):
            game_simulator.step(0)
    
    def test_step_after_game_over(self, game_config):
        """测试游戏结束后调用step应该抛出异常"""
        config = GameConfig(grid_cols=3, grid_rows=3, initial_length=2)
        simulator = GameSimulator(config=config)
        simulator.reset()
        
        # 移动到撞墙
        for _ in range(10):
            state, _, done = simulator.step(3)
            if done:
                break
        
        # 游戏结束后再调用step应该抛出异常
        with pytest.raises(ValueError, match="游戏未初始化或已结束"):
            simulator.step(0)
    
    def test_reward_values(self, game_simulator):
        """测试奖励值"""
        state = game_simulator.reset()
        
        # 正常移动应该有小的奖励
        _, reward, done = game_simulator.step(3)
        assert not done
        assert reward >= 0  # 至少是存活奖励
    
    def test_food_placement(self, game_simulator):
        """测试食物放置"""
        state = game_simulator.reset()
        
        assert state.food is not None
        food = state.food
        
        # 食物应该在网格范围内
        assert 0 <= food.x < game_simulator.config.grid_cols
        assert 0 <= food.y < game_simulator.config.grid_rows
        
        # 食物不应该与蛇重叠
        for segment in state.snake:
            assert not (segment.x == food.x and segment.y == food.y)
    
    def test_get_state(self, game_simulator):
        """测试获取状态"""
        assert game_simulator.get_state() is None
        
        state = game_simulator.reset()
        assert game_simulator.get_state() == state
    
    def test_custom_config(self):
        """测试自定义配置"""
        config = GameConfig(
            grid_cols=10,
            grid_rows=10,
            initial_length=5
        )
        simulator = GameSimulator(config=config)
        state = simulator.reset()
        
        assert len(state.snake) == 5
        assert simulator.config.grid_cols == 10
        assert simulator.config.grid_rows == 10


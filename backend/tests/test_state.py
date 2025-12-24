"""
状态提取器单元测试
"""

import pytest
from app.services.game.simulator import GameState, Position, Direction
from app.services.game.state import extract_state, _check_danger, _is_cell_safe, _rotate_direction


class TestStateExtractor:
    """状态提取器测试类"""
    
    def test_extract_state_basic(self):
        """测试基本状态提取"""
        # 创建测试游戏状态
        snake = [
            Position(x=12, y=12),
            Position(x=11, y=12),
            Position(x=10, y=12),
        ]
        direction = Direction(x=1, y=0)  # 向右
        food = Position(x=15, y=12)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        
        assert len(state_vector) == 11
        assert all(isinstance(v, (int, float)) for v in state_vector)
    
    def test_extract_state_head_position(self):
        """测试蛇头位置归一化"""
        snake = [Position(x=12, y=12)]
        direction = Direction(x=1, y=0)
        food = Position(x=15, y=12)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        
        # 头位置应该在[0, 1]范围内
        assert 0 <= state_vector[0] <= 1  # head_x
        assert 0 <= state_vector[1] <= 1  # head_y
        assert abs(state_vector[0] - 0.5) < 0.1  # 12/24 = 0.5
        assert abs(state_vector[1] - 0.5) < 0.1
    
    def test_extract_state_food_position(self):
        """测试食物相对位置"""
        snake = [Position(x=10, y=10)]
        direction = Direction(x=1, y=0)
        food = Position(x=15, y=12)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        
        # food_dx = (15-10)/24 = 5/24 ≈ 0.208
        # food_dy = (12-10)/24 = 2/24 ≈ 0.083
        assert abs(state_vector[2] - 5/24) < 0.01  # food_dx
        assert abs(state_vector[3] - 2/24) < 0.01  # food_dy
    
    def test_extract_state_no_food(self):
        """测试没有食物时的状态"""
        snake = [Position(x=12, y=12)]
        direction = Direction(x=1, y=0)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=None,
            score=0,
            game_running=True,
            game_over=False
        )
        
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        
        # 食物位置应该为0
        assert state_vector[2] == 0.0  # food_dx
        assert state_vector[3] == 0.0  # food_dy
    
    def test_extract_state_direction_encoding(self):
        """测试方向编码"""
        snake = [Position(x=12, y=12)]
        food = Position(x=15, y=12)
        
        # 测试向右
        direction = Direction(x=1, y=0)
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        state_vector = extract_state(state)
        assert state_vector[7] == 0  # up
        assert state_vector[8] == 0  # down
        assert state_vector[9] == 0  # left
        assert state_vector[10] == 1  # right
        
        # 测试向上
        direction = Direction(x=0, y=-1)
        state.direction = direction
        state.next_direction = direction
        state_vector = extract_state(state)
        assert state_vector[7] == 1  # up
        assert state_vector[8] == 0  # down
        assert state_vector[9] == 0  # left
        assert state_vector[10] == 0  # right
        
        # 测试向下
        direction = Direction(x=0, y=1)
        state.direction = direction
        state.next_direction = direction
        state_vector = extract_state(state)
        assert state_vector[7] == 0  # up
        assert state_vector[8] == 1  # down
        assert state_vector[9] == 0  # left
        assert state_vector[10] == 0  # right
        
        # 测试向左
        direction = Direction(x=-1, y=0)
        state.direction = direction
        state.next_direction = direction
        state_vector = extract_state(state)
        assert state_vector[7] == 0  # up
        assert state_vector[8] == 0  # down
        assert state_vector[9] == 1  # left
        assert state_vector[10] == 0  # right
    
    def test_danger_detection(self):
        """测试危险检测"""
        # 蛇在边界附近
        snake = [Position(x=0, y=12)]
        direction = Direction(x=-1, y=0)  # 向左（会撞墙）
        food = Position(x=15, y=12)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        
        # 前方应该有危险
        assert state_vector[4] == 1  # danger_straight
    
    def test_is_cell_safe(self):
        """测试单元格安全性检查"""
        snake = [Position(x=5, y=5), Position(x=4, y=5)]
        
        # 测试安全位置
        safe_pos = Position(x=6, y=5)
        assert _is_cell_safe(safe_pos, snake, 24, 24) is True
        
        # 测试撞到身体
        body_pos = Position(x=4, y=5)
        assert _is_cell_safe(body_pos, snake, 24, 24) is False
        
        # 测试越界
        out_of_bounds = Position(x=-1, y=5)
        assert _is_cell_safe(out_of_bounds, snake, 24, 24) is False
        
        out_of_bounds2 = Position(x=24, y=5)
        assert _is_cell_safe(out_of_bounds2, snake, 24, 24) is False
    
    def test_rotate_direction_right(self):
        """测试右转"""
        # 上 -> 右
        dir_up = Direction(x=0, y=-1)
        dir_right = _rotate_direction(dir_up, 'right')
        assert dir_right.x == 1
        assert dir_right.y == 0
        
        # 右 -> 下
        dir_down = _rotate_direction(dir_right, 'right')
        assert dir_down.x == 0
        assert dir_down.y == 1
        
        # 下 -> 左
        dir_left = _rotate_direction(dir_down, 'right')
        assert dir_left.x == -1
        assert dir_left.y == 0
        
        # 左 -> 上
        dir_up_again = _rotate_direction(dir_left, 'right')
        assert dir_up_again.x == 0
        assert dir_up_again.y == -1
    
    def test_rotate_direction_left(self):
        """测试左转"""
        # 上 -> 左
        dir_up = Direction(x=0, y=-1)
        dir_left = _rotate_direction(dir_up, 'left')
        assert dir_left.x == -1
        assert dir_left.y == 0
        
        # 左 -> 下
        dir_down = _rotate_direction(dir_left, 'left')
        assert dir_down.x == 0
        assert dir_down.y == 1
        
        # 下 -> 右
        dir_right = _rotate_direction(dir_down, 'left')
        assert dir_right.x == 1
        assert dir_right.y == 0
        
        # 右 -> 上
        dir_up_again = _rotate_direction(dir_right, 'left')
        assert dir_up_again.x == 0
        assert dir_up_again.y == -1
    
    def test_check_danger(self):
        """测试危险检查"""
        # 蛇在边界，向前移动会撞墙
        snake = [Position(x=0, y=12)]
        direction = Direction(x=-1, y=0)  # 向左
        food = Position(x=15, y=12)
        
        state = GameState(
            snake=snake,
            direction=direction,
            next_direction=direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        assert _check_danger(state, direction, 24, 24) is True
        
        # 蛇在中间，向前移动安全
        snake = [Position(x=12, y=12)]
        direction = Direction(x=1, y=0)  # 向右
        
        state.snake = snake
        state.direction = direction
        state.next_direction = direction
        
        assert _check_danger(state, direction, 24, 24) is False


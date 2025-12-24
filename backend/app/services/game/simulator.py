"""
游戏模拟器：无UI的贪吃蛇游戏实现
与前端JS逻辑保持一致
"""

import random
from typing import List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class Position:
    """位置坐标"""
    x: int
    y: int


@dataclass
class Direction:
    """方向向量"""
    x: int
    y: int


@dataclass
class GameConfig:
    """游戏配置（与前端保持一致）"""
    grid_cols: int = 24
    grid_rows: int = 24
    initial_length: int = 4
    resource_area_x_min_percent: float = 0.30
    resource_area_x_max_percent: float = 0.70
    resource_area_y_min_percent: float = 0.40
    resource_area_y_max_percent: float = 0.60


@dataclass
class GameState:
    """游戏状态"""
    snake: List[Position]
    direction: Direction
    next_direction: Direction
    food: Optional[Position]
    score: int
    game_running: bool
    game_over: bool


class GameSimulator:
    """游戏模拟器"""
    
    def __init__(self, config: Optional[GameConfig] = None):
        self.config = config or GameConfig()
        self.state: Optional[GameState] = None
    
    def reset(self) -> GameState:
        """重置游戏到初始状态"""
        center_x = self.config.grid_cols // 2
        center_y = self.config.grid_rows // 2
        
        # 初始化蛇（水平放置，长度为initial_length）
        snake = []
        for i in range(self.config.initial_length - 1, -1, -1):
            snake.append(Position(x=center_x - i, y=center_y))
        
        initial_direction = Direction(x=1, y=0)  # 向右
        
        # 放置食物
        food = self._place_food(snake)
        
        self.state = GameState(
            snake=snake,
            direction=initial_direction,
            next_direction=initial_direction,
            food=food,
            score=0,
            game_running=True,
            game_over=False
        )
        
        return self.state
    
    def step(self, action: int) -> Tuple[GameState, float, bool]:
        """
        执行一步动作
        
        Args:
            action: 动作索引（0=上, 1=下, 2=左, 3=右）
        
        Returns:
            (新状态, 奖励, 是否结束)
        """
        if self.state is None or self.state.game_over:
            raise ValueError("游戏未初始化或已结束，请先调用reset()")
        
        # 动作到方向的映射
        action_to_direction = [
            Direction(x=0, y=-1),  # 0: 上
            Direction(x=0, y=1),  # 1: 下
            Direction(x=-1, y=0),  # 2: 左
            Direction(x=1, y=0),  # 3: 右
        ]
        
        new_direction = action_to_direction[action]
        
        # 更新方向（禁止直接反向）
        if not self._is_opposite(self.state.direction, new_direction):
            self.state.next_direction = new_direction
        
        # 保存旧状态用于奖励计算
        prev_score = self.state.score
        prev_state = self._copy_state(self.state)
        
        # 更新蛇的位置
        self._update_snake()
        
        # 检查碰撞
        if self._check_collision():
            self.state.game_over = True
            self.state.game_running = False
            reward = -10.0  # 撞墙或撞自己
            return self.state, reward, True
        
        # 检查是否吃到食物
        if self.state.food and self._check_food_collision():
            self.state.score += 1
            self.state.food = self._place_food(self.state.snake)
            reward = 10.0  # 吃到食物
        else:
            reward = 0.1  # 存活奖励
        
        # 计算移动方向奖励（可选）
        if self.state.food and prev_state.food:
            prev_head = prev_state.snake[-1]
            curr_head = self.state.snake[-1]
            food = self.state.food
            
            prev_dist = abs(prev_head.x - food.x) + abs(prev_head.y - food.y)
            curr_dist = abs(curr_head.x - food.x) + abs(curr_head.y - food.y)
            
            if curr_dist < prev_dist:
                reward += 0.5  # 靠近食物
            elif curr_dist > prev_dist:
                reward -= 0.5  # 远离食物
        
        return self.state, reward, False
    
    def _update_snake(self):
        """更新蛇的位置"""
        if self.state is None:
            return
        
        # 应用下一方向
        self.state.direction = self.state.next_direction
        
        # 计算新头部位置
        head = self.state.snake[-1]
        new_head = Position(
            x=head.x + self.state.direction.x,
            y=head.y + self.state.direction.y
        )
        
        # 检查是否吃到食物（决定是否移除尾部）
        if self.state.food and self._check_food_collision_at(new_head):
            # 吃到食物：不移除尾部（蛇变长）
            self.state.snake.append(new_head)
        else:
            # 未吃到食物：移除尾部（正常移动）
            self.state.snake = self.state.snake[1:] + [new_head]
    
    def _check_collision(self) -> bool:
        """检查碰撞（撞墙或撞自己）"""
        if self.state is None:
            return False
        
        head = self.state.snake[-1]
        
        # 撞墙
        if (head.x < 0 or head.x >= self.config.grid_cols or
            head.y < 0 or head.y >= self.config.grid_rows):
            return True
        
        # 撞到自己（不包含最后一个头部）
        for i in range(len(self.state.snake) - 1):
            if self.state.snake[i].x == head.x and self.state.snake[i].y == head.y:
                return True
        
        return False
    
    def _check_food_collision(self) -> bool:
        """检查是否吃到食物"""
        if self.state is None or not self.state.food:
            return False
        
        head = self.state.snake[-1]
        return head.x == self.state.food.x and head.y == self.state.food.y
    
    def _check_food_collision_at(self, position: Position) -> bool:
        """检查指定位置是否吃到食物"""
        if self.state is None or not self.state.food:
            return False
        
        return position.x == self.state.food.x and position.y == self.state.food.y
    
    def _place_food(self, snake: List[Position]) -> Position:
        """随机放置食物（避免与蛇重叠）"""
        cols = self.config.grid_cols
        rows = self.config.grid_rows
        
        # 计算资源区域范围
        xmin = int(cols * self.config.resource_area_x_min_percent)
        xmax = int(cols * self.config.resource_area_x_max_percent)
        ymin = int(rows * self.config.resource_area_y_min_percent)
        ymax = int(rows * self.config.resource_area_y_max_percent)
        
        attempts = 0
        while attempts < 200:
            # 优先在资源区域生成
            if attempts < 100:
                x = random.randint(xmin, xmax - 1) if xmax > xmin else random.randint(0, cols - 1)
                y = random.randint(ymin, ymax - 1) if ymax > ymin else random.randint(0, rows - 1)
            else:
                # 回退到整个地图
                x = random.randint(0, cols - 1)
                y = random.randint(0, rows - 1)
            
            # 检查是否与蛇重叠
            collide = any(seg.x == x and seg.y == y for seg in snake)
            
            if not collide:
                return Position(x=x, y=y)
            
            attempts += 1
        
        # 如果200次尝试都失败，返回一个默认位置（理论上不应该发生）
        return Position(x=cols // 2, y=rows // 2)
    
    def _is_opposite(self, dir1: Direction, dir2: Direction) -> bool:
        """检查两个方向是否相反"""
        return dir1.x == -dir2.x and dir1.y == -dir2.y
    
    def _copy_state(self, state: GameState) -> GameState:
        """复制游戏状态"""
        return GameState(
            snake=[Position(x=p.x, y=p.y) for p in state.snake],
            direction=Direction(x=state.direction.x, y=state.direction.y),
            next_direction=Direction(x=state.next_direction.x, y=state.next_direction.y),
            food=Position(x=state.food.x, y=state.food.y) if state.food else None,
            score=state.score,
            game_running=state.game_running,
            game_over=state.game_over
        )
    
    def get_state(self) -> Optional[GameState]:
        """获取当前游戏状态"""
        return self.state


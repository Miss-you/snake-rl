"""
状态提取器：将游戏状态转换为RL可用的特征向量
与前端JS逻辑保持一致
"""

from typing import List
from .simulator import GameState, Position, Direction


def extract_state(game_state: GameState, grid_cols: int = 24, grid_rows: int = 24) -> List[float]:
    """
    从游戏状态提取RL状态向量（11维）
    
    Args:
        game_state: 游戏状态
        grid_cols: 网格列数
        grid_rows: 网格行数
    
    Returns:
        11维状态向量：
        [headX, headY, foodDx, foodDy, dangerStraight, dangerRight, dangerLeft,
         directionUp, directionDown, directionLeft, directionRight]
    """
    snake = game_state.snake
    direction = game_state.direction
    food = game_state.food
    
    head = snake[-1]
    
    # 归一化蛇头位置
    head_x = head.x / grid_cols
    head_y = head.y / grid_rows
    
    # 食物相对位置（归一化）
    food_dx = (food.x - head.x) / grid_cols if food else 0.0
    food_dy = (food.y - head.y) / grid_rows if food else 0.0
    
    # 危险检测：检查三个方向（前、右、左）
    danger_straight = 1 if _check_danger(game_state, direction, grid_cols, grid_rows) else 0
    danger_right = 1 if _check_danger(game_state, _rotate_direction(direction, 'right'), grid_cols, grid_rows) else 0
    danger_left = 1 if _check_danger(game_state, _rotate_direction(direction, 'left'), grid_cols, grid_rows) else 0
    
    # 当前方向（one-hot编码）
    direction_up = 1 if direction.y == -1 else 0
    direction_down = 1 if direction.y == 1 else 0
    direction_left = 1 if direction.x == -1 else 0
    direction_right = 1 if direction.x == 1 else 0
    
    return [
        head_x,
        head_y,
        food_dx,
        food_dy,
        danger_straight,
        danger_right,
        danger_left,
        direction_up,
        direction_down,
        direction_left,
        direction_right,
    ]


def _check_danger(game_state: GameState, dir: Direction, grid_cols: int, grid_rows: int) -> bool:
    """检查某个方向是否有危险（撞墙或撞自己）"""
    head = game_state.snake[-1]
    next_pos = Position(x=head.x + dir.x, y=head.y + dir.y)
    
    return not _is_cell_safe(next_pos, game_state.snake, grid_cols, grid_rows)


def _is_cell_safe(position: Position, snake: List[Position], grid_cols: int, grid_rows: int) -> bool:
    """判断格子是否安全"""
    # 检查是否越界
    if position.x < 0 or position.x >= grid_cols or position.y < 0 or position.y >= grid_rows:
        return False
    
    # 检查是否撞到身体
    for seg in snake:
        if seg.x == position.x and seg.y == position.y:
            return False
    
    return True


def _rotate_direction(dir: Direction, direction: str) -> Direction:
    """旋转方向（右转或左转）"""
    if direction == 'right':
        # 右转：上->右->下->左
        if dir.x == 0 and dir.y == -1:
            return Direction(x=1, y=0)  # 上 -> 右
        if dir.x == 1 and dir.y == 0:
            return Direction(x=0, y=1)  # 右 -> 下
        if dir.x == 0 and dir.y == 1:
            return Direction(x=-1, y=0)  # 下 -> 左
        if dir.x == -1 and dir.y == 0:
            return Direction(x=0, y=-1)  # 左 -> 上
    else:
        # 左转：上->左->下->右
        if dir.x == 0 and dir.y == -1:
            return Direction(x=-1, y=0)  # 上 -> 左
        if dir.x == -1 and dir.y == 0:
            return Direction(x=0, y=1)  # 左 -> 下
        if dir.x == 0 and dir.y == 1:
            return Direction(x=1, y=0)  # 下 -> 右
        if dir.x == 1 and dir.y == 0:
            return Direction(x=0, y=-1)  # 右 -> 上
    
    return dir


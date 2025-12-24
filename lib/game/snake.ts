import type { Position, Direction, GameState } from './types';
import { checkFoodCollision, placeFood } from './food';

/**
 * 更新蛇的位置（包含吃食物与生长逻辑）
 */
export function updateSnakePosition(state: GameState): GameState {
  const { snake, direction, nextDirection, food } = state;
  
  // 应用下一方向（防止连续反向）
  const currentDirection = nextDirection;
  const head = snake[snake.length - 1];
  const newHead: Position = {
    x: head.x + currentDirection.x,
    y: head.y + currentDirection.y,
  };

  // 吃到食物：加分并生长（不移除尾巴）
  if (checkFoodCollision(newHead, food)) {
    const newSnake = [...snake, newHead];
    const newFood = placeFood(newSnake);
    return {
      ...state,
      snake: newSnake,
      direction: currentDirection,
      nextDirection: currentDirection,
      food: newFood,
      score: state.score + 1,
    };
  }

  // 未吃到食物：正常移动（移除尾巴）
  const newSnake = [...snake.slice(1), newHead];
  return {
    ...state,
    snake: newSnake,
    direction: currentDirection,
    nextDirection: currentDirection,
  };
}

/**
 * 处理方向改变，禁止直接反向
 */
export function handleDirectionChange(
  state: GameState,
  newDirection: Direction
): GameState {
  const { direction } = state;
  const opposite = direction.x === -newDirection.x && direction.y === -newDirection.y;
  
  if (opposite) {
    return state; // 禁止直接反向
  }
  
  return {
    ...state,
    nextDirection: newDirection,
  };
}


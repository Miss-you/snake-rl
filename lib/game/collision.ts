import type { Position, GameState } from './types';
import { config } from './config';

/**
 * 判断下一个格子是否安全
 */
export function isCellSafe(position: Position, snake: Position[]): boolean {
  const { cols, rows } = config.grid;
  const { x, y } = position;
  
  // 检查是否越界
  if (x < 0 || x >= cols || y < 0 || y >= rows) {
    return false;
  }
  
  // 检查是否撞到身体
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return false;
    }
  }
  
  return true;
}

/**
 * 碰撞检测：撞墙或撞到自己则返回 true
 */
export function checkCollision(state: GameState): boolean {
  const { cols, rows } = config.grid;
  const { snake } = state;
  const head = snake[snake.length - 1];

  // 撞墙
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    return true;
  }

  // 撞到自己（不包含最后一个头部）
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}


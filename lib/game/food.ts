import type { Position, GameState } from './types';
import { config } from './config';

/**
 * 随机放置食物（避免与蛇重叠）
 */
export function placeFood(snake: Position[]): Position {
  const { cols, rows } = config.grid;
  const area = config.resourceArea;
  const xmin = Math.floor(cols * area.xMinPercent);
  const xmax = Math.ceil(cols * area.xMaxPercent) - 1;
  const ymin = Math.floor(rows * area.yMinPercent);
  const ymax = Math.ceil(rows * area.yMaxPercent) - 1;
  
  let attempts = 0;
  let x: number, y: number;
  let collide: boolean;
  
  do {
    const rx = xmin + Math.floor(Math.random() * Math.max(1, (xmax - xmin + 1)));
    const ry = ymin + Math.floor(Math.random() * Math.max(1, (ymax - ymin + 1)));
    x = rx;
    y = ry;
    collide = snake.some(seg => seg.x === x && seg.y === y);
    attempts++;
    
    // 若中央区域过满，回退到整个地图尝试
    if (attempts > 100) {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
    }
  } while (collide);
  
  return { x, y };
}

/**
 * 检查是否吃到食物
 */
export function checkFoodCollision(head: Position, food: Position | null): boolean {
  if (!food) return false;
  return head.x === food.x && head.y === food.y;
}


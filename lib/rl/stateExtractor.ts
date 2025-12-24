/**
 * 状态提取器：将游戏状态转换为RL可用的特征向量
 */

import type { GameState, Position, Direction } from '../game/types';
import type { RLState } from './types';
import { config } from '../game/config';
import { isCellSafe } from '../game/collision';

/**
 * 从游戏状态提取RL状态
 */
export function extractState(gameState: GameState): RLState {
  const { snake, direction, food } = gameState;
  const { cols, rows } = config.grid;
  const head = snake[snake.length - 1];
  
  // 归一化蛇头位置
  const headX = head.x / cols;
  const headY = head.y / rows;
  
  // 食物相对位置（归一化）
  const foodDx = food ? (food.x - head.x) / cols : 0;
  const foodDy = food ? (food.y - head.y) / rows : 0;
  
  // 危险检测：检查三个方向（前、右、左）
  const dangerStraight = checkDanger(gameState, direction) ? 1 : 0;
  const dangerRight = checkDanger(gameState, rotateDirection(direction, 'right')) ? 1 : 0;
  const dangerLeft = checkDanger(gameState, rotateDirection(direction, 'left')) ? 1 : 0;
  
  // 当前方向（one-hot编码）
  const directionUp = direction.y === -1 ? 1 : 0;
  const directionDown = direction.y === 1 ? 1 : 0;
  const directionLeft = direction.x === -1 ? 1 : 0;
  const directionRight = direction.x === 1 ? 1 : 0;
  
  return {
    headX,
    headY,
    foodDx,
    foodDy,
    dangerStraight,
    dangerRight,
    dangerLeft,
    directionUp,
    directionDown,
    directionLeft,
    directionRight,
    toArray() {
      return [
        this.headX,
        this.headY,
        this.foodDx,
        this.foodDy,
        this.dangerStraight,
        this.dangerRight,
        this.dangerLeft,
        this.directionUp,
        this.directionDown,
        this.directionLeft,
        this.directionRight,
      ];
    },
  };
}

/**
 * 检查某个方向是否有危险（撞墙或撞自己）
 */
function checkDanger(gameState: GameState, dir: Direction): boolean {
  const head = gameState.snake[gameState.snake.length - 1];
  const nextPos: Position = {
    x: head.x + dir.x,
    y: head.y + dir.y,
  };
  return !isCellSafe(nextPos, gameState.snake);
}

/**
 * 旋转方向（右转或左转）
 */
function rotateDirection(dir: Direction, direction: 'right' | 'left'): Direction {
  if (direction === 'right') {
    // 右转：上->右->下->左
    if (dir.x === 0 && dir.y === -1) return { x: 1, y: 0 }; // 上 -> 右
    if (dir.x === 1 && dir.y === 0) return { x: 0, y: 1 };  // 右 -> 下
    if (dir.x === 0 && dir.y === 1) return { x: -1, y: 0 }; // 下 -> 左
    if (dir.x === -1 && dir.y === 0) return { x: 0, y: -1 }; // 左 -> 上
  } else {
    // 左转：上->左->下->右
    if (dir.x === 0 && dir.y === -1) return { x: -1, y: 0 }; // 上 -> 左
    if (dir.x === -1 && dir.y === 0) return { x: 0, y: 1 };  // 左 -> 下
    if (dir.x === 0 && dir.y === 1) return { x: 1, y: 0 };   // 下 -> 右
    if (dir.x === 1 && dir.y === 0) return { x: 0, y: -1 };  // 右 -> 上
  }
  return dir;
}


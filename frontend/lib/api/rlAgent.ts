/**
 * RL Agent - 使用后端模型进行推理
 */

import type { GameState } from '../game/types';
import type { Direction } from '../game/types';
import { extractState } from '../rl/stateExtractor';
import { apiClient } from './client';

/**
 * 动作到方向的映射
 */
const ACTION_TO_DIRECTION: Direction[] = [
  { x: 0, y: -1 },  // 0: 上
  { x: 0, y: 1 },   // 1: 下
  { x: -1, y: 0 },  // 2: 左
  { x: 1, y: 0 },   // 3: 右
];

/**
 * RL Agent - 使用后端模型进行决策
 */
export class RLAgent {
  private useBackend: boolean = true;
  private fallbackToLocal: boolean = true;

  /**
   * 选择动作
   */
  async selectAction(state: GameState): Promise<Direction> {
    if (!this.useBackend) {
      return this.fallbackAction(state);
    }

    try {
      // 提取状态向量
      const stateVector = extractState(state).toArray();

      // 调用后端API预测动作
      const prediction = await apiClient.predictAction(stateVector);

      // 转换为方向
      return ACTION_TO_DIRECTION[prediction.action];
    } catch (error) {
      console.error('Failed to get prediction from backend:', error);
      
      if (this.fallbackToLocal) {
        return this.fallbackAction(state);
      }
      
      throw error;
    }
  }

  /**
   * 回退动作（简单的规则）
   */
  private fallbackAction(state: GameState): Direction {
    // 简单的规则：朝向食物
    const { snake, food, direction } = state;
    if (!food) {
      return direction;
    }

    const head = snake[snake.length - 1];
    const dx = food.x - head.x;
    const dy = food.y - head.y;

    // 优先选择朝向食物的方向
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: Math.sign(dx), y: 0 };
    } else {
      return { x: 0, y: Math.sign(dy) };
    }
  }

  /**
   * 设置是否使用后端
   */
  setUseBackend(use: boolean): void {
    this.useBackend = use;
  }

  /**
   * 设置是否允许回退
   */
  setFallbackToLocal(allow: boolean): void {
    this.fallbackToLocal = allow;
  }
}


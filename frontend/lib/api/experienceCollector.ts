/**
 * 经验收集器 - 收集游戏经验并批量发送到后端
 */

import type { GameState } from '../game/types';
import type { Experience } from '../rl/types';
import { extractState } from '../rl/stateExtractor';
import { calculateReward } from '../rl/rewardCalculator';
import { defaultTrainingConfig } from '../rl/config';
import { apiClient } from './client';

/**
 * 经验收集器
 */
export class ExperienceCollector {
  private buffer: Experience[] = [];
  private bufferSize: number = 50; // 每50条经验发送一次
  private previousState: GameState | null = null;
  private currentState: GameState | null = null;
  private lastAction: number | null = null;

  constructor(bufferSize: number = 50) {
    this.bufferSize = bufferSize;
  }

  /**
   * 记录一步经验
   */
  recordStep(
    prevState: GameState,
    action: number,
    currentState: GameState,
    done: boolean
  ): void {
    // 提取状态
    const stateVector = extractState(prevState).toArray();
    const nextStateVector = extractState(currentState).toArray();

    // 计算奖励
    const reward = calculateReward(
      prevState,
      currentState,
      true,
      defaultTrainingConfig
    );

    // 创建经验
    const experience: Experience = {
      state: stateVector,
      action,
      reward,
      nextState: nextStateVector,
      done,
    };

    // 添加到缓冲区
    this.buffer.push(experience);

    // 如果缓冲区满了，发送到后端
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * 立即发送缓冲区中的所有经验
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    try {
      await apiClient.submitExperience([...this.buffer]);
      this.buffer = []; // 清空缓冲区
    } catch (error) {
      console.error('Failed to submit experiences:', error);
      // 可以选择保留经验或丢弃
    }
  }

  /**
   * 重置收集器
   */
  reset(): void {
    this.buffer = [];
    this.previousState = null;
    this.currentState = null;
    this.lastAction = null;
  }

  /**
   * 获取当前缓冲区大小
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}


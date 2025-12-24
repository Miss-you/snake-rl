/**
 * 强化学习相关的类型定义
 */

import type { Position, Direction, GameState } from '../game/types';

/**
 * 状态表示（特征向量方式）
 */
export interface RLState {
  // 蛇头位置（归一化到0-1）
  headX: number;
  headY: number;
  
  // 食物相对位置（归一化）
  foodDx: number;
  foodDy: number;
  
  // 危险检测（0或1）
  dangerStraight: number;
  dangerRight: number;
  dangerLeft: number;
  
  // 当前方向（one-hot编码）
  directionUp: number;
  directionDown: number;
  directionLeft: number;
  directionRight: number;
  
  // 转换为数组（用于神经网络输入）
  toArray(): number[];
}

/**
 * 经验回放缓冲区中的一条经验
 */
export interface Experience {
  state: number[];        // 当前状态向量
  action: number;         // 动作索引（0-3）
  reward: number;         // 奖励
  nextState: number[];    // 下一状态向量
  done: boolean;          // 是否结束
}

/**
 * 训练配置
 */
export interface TrainingConfig {
  // 网络配置
  learningRate: number;
  batchSize: number;
  hiddenLayers: number[];
  
  // 训练配置
  epsilonStart: number;      // 初始探索率
  epsilonEnd: number;       // 最终探索率
  epsilonDecay: number;      // 探索率衰减
  gamma: number;             // 折扣因子
  memorySize: number;        // 经验回放缓冲区大小
  updateTargetEvery: number; // 每N步更新目标网络
  
  // 奖励配置
  rewardEatFood: number;
  rewardHitWall: number;
  rewardHitSelf: number;
  rewardSurvive: number;
  rewardMoveTowardsFood: number;
}

/**
 * 训练统计
 */
export interface TrainingStats {
  episode: number;
  score: number;
  steps: number;
  epsilon: number;
  averageScore: number;
  maxScore: number;
  loss?: number;
}


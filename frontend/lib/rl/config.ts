/**
 * 强化学习训练配置
 */

import type { TrainingConfig } from './types';

/**
 * 默认训练配置
 */
export const defaultTrainingConfig: TrainingConfig = {
  // 网络配置
  learningRate: 0.001,
  batchSize: 64,
  hiddenLayers: [128, 128], // 两个隐藏层，每层128个神经元
  
  // 训练配置
  epsilonStart: 1.0,        // 初始100%探索
  epsilonEnd: 0.01,         // 最终1%探索
  epsilonDecay: 0.995,      // 每步衰减0.5%
  gamma: 0.9,               // 折扣因子（未来奖励的重要性）
  memorySize: 10000,        // 经验回放缓冲区大小
  updateTargetEvery: 100,   // 每100步更新目标网络
  
  // 奖励配置
  rewardEatFood: 10,
  rewardHitWall: -10,
  rewardHitSelf: -10,
  rewardSurvive: 0.1,
  rewardMoveTowardsFood: 0.5,
};

/**
 * 快速训练配置（用于测试）
 */
export const quickTrainingConfig: TrainingConfig = {
  ...defaultTrainingConfig,
  batchSize: 32,
  memorySize: 1000,
  epsilonDecay: 0.99,
};


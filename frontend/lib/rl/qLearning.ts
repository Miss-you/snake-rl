/**
 * Q-Learning 算法实现（简单版本，用于理解）
 * 
 * ⚠️ 警告：此文件仅作为学习参考，不应在前端使用！
 * 
 * 训练逻辑应该在Python后端实现，前端只负责：
 * 1. 调用后端API进行推理
 * 2. 收集经验并发送到后端
 * 
 * Q-Learning 是强化学习中最基础的算法之一
 * 核心思想：学习状态-动作对的价值 Q(s,a)
 */

import type { TrainingConfig } from './types';

/**
 * Q表：存储状态-动作对的价值
 * 格式：Map<stateString, [qValue0, qValue1, qValue2, qValue3]>
 * 其中 stateString 是状态的字符串表示，数组对应4个动作的Q值
 */
export class QTable {
  private table: Map<string, number[]>;
  private learningRate: number;
  private gamma: number;

  constructor(learningRate: number, gamma: number) {
    this.table = new Map();
    this.learningRate = learningRate;
    this.gamma = gamma;
  }

  /**
   * 获取Q值
   */
  getQ(state: number[], action: number): number {
    const key = this.stateToKey(state);
    const qValues = this.table.get(key);
    if (!qValues) {
      // 如果状态不存在，初始化为0
      this.table.set(key, [0, 0, 0, 0]);
      return 0;
    }
    return qValues[action];
  }

  /**
   * 更新Q值（Q-Learning更新公式）
   * Q(s,a) = Q(s,a) + α[r + γ * max(Q(s',a')) - Q(s,a)]
   */
  updateQ(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean
  ): void {
    const currentQ = this.getQ(state, action);
    
    if (done) {
      // 如果游戏结束，没有未来奖励
      const newQ = currentQ + this.learningRate * (reward - currentQ);
      this.setQ(state, action, newQ);
    } else {
      // 计算最大未来Q值
      const maxNextQ = Math.max(
        this.getQ(nextState, 0),
        this.getQ(nextState, 1),
        this.getQ(nextState, 2),
        this.getQ(nextState, 3)
      );
      
      // Q-Learning更新公式
      const newQ = currentQ + this.learningRate * (reward + this.gamma * maxNextQ - currentQ);
      this.setQ(state, action, newQ);
    }
  }

  /**
   * 设置Q值
   */
  private setQ(state: number[], action: number, value: number): void {
    const key = this.stateToKey(state);
    const qValues = this.table.get(key) || [0, 0, 0, 0];
    qValues[action] = value;
    this.table.set(key, qValues);
  }

  /**
   * 选择最佳动作（贪婪策略）
   */
  getBestAction(state: number[]): number {
    const qValues = [
      this.getQ(state, 0),
      this.getQ(state, 1),
      this.getQ(state, 2),
      this.getQ(state, 3),
    ];
    
    // 找到最大Q值的动作
    const maxQ = Math.max(...qValues);
    const bestActions = qValues
      .map((q, idx) => (q === maxQ ? idx : -1))
      .filter(idx => idx !== -1);
    
    // 如果有多个相同Q值，随机选择
    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }

  /**
   * 将状态数组转换为字符串键
   */
  private stateToKey(state: number[]): string {
    // 将状态数组四舍五入到2位小数，减少状态空间
    return state.map(s => s.toFixed(2)).join(',');
  }

  /**
   * 获取Q表大小（用于监控）
   */
  getSize(): number {
    return this.table.size;
  }
}

/**
 * ε-贪婪策略：平衡探索和利用
 */
export class EpsilonGreedyPolicy {
  private epsilon: number;
  private epsilonEnd: number;
  private epsilonDecay: number;

  constructor(config: TrainingConfig) {
    this.epsilon = config.epsilonStart;
    this.epsilonEnd = config.epsilonEnd;
    this.epsilonDecay = config.epsilonDecay;
  }

  /**
   * 选择动作
   * @param qTable Q表
   * @param state 当前状态
   * @returns 动作索引（0-3）
   */
  selectAction(qTable: QTable, state: number[]): number {
    // 以ε概率随机探索，1-ε概率利用（选择最佳动作）
    if (Math.random() < this.epsilon) {
      // 随机探索
      return Math.floor(Math.random() * 4);
    } else {
      // 利用：选择最佳动作
      return qTable.getBestAction(state);
    }
  }

  /**
   * 衰减探索率
   */
  decay(): void {
    if (this.epsilon > this.epsilonEnd) {
      this.epsilon *= this.epsilonDecay;
    }
  }

  /**
   * 获取当前探索率
   */
  getEpsilon(): number {
    return this.epsilon;
  }
}

/**
 * Q-Learning Agent
 */
export class QLearningAgent {
  private qTable: QTable;
  private policy: EpsilonGreedyPolicy;
  private config: TrainingConfig;

  constructor(config: TrainingConfig) {
    this.config = config;
    this.qTable = new QTable(config.learningRate, config.gamma);
    this.policy = new EpsilonGreedyPolicy(config);
  }

  /**
   * 选择动作
   */
  selectAction(state: number[]): number {
    return this.policy.selectAction(this.qTable, state);
  }

  /**
   * 更新Q值（学习）
   */
  learn(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean
  ): void {
    this.qTable.updateQ(state, action, reward, nextState, done);
  }

  /**
   * 衰减探索率
   */
  decayEpsilon(): void {
    this.policy.decay();
  }

  /**
   * 获取当前探索率
   */
  getEpsilon(): number {
    return this.policy.getEpsilon();
  }

  /**
   * 获取Q表大小
   */
  getQTableSize(): number {
    return this.qTable.getSize();
  }
}


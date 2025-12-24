/**
 * RL训练Hook - 集成Q-Learning到游戏循环
 * 
 * ⚠️ 已废弃：此文件不应使用！
 * 
 * 训练逻辑应该在Python后端实现。
 * 请使用 useRLInference.ts 替代，它只负责推理。
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, Direction } from '@/lib/game/types';
import { QLearningAgent } from '@/lib/rl/qLearning';
import { extractState } from '@/lib/rl/stateExtractor';
import { calculateReward } from '@/lib/rl/rewardCalculator';
import { defaultTrainingConfig } from '@/lib/rl/config';

/**
 * RL训练统计
 */
export interface RLTrainingStats {
  episode: number;
  score: number;
  steps: number;
  epsilon: number;
  averageScore: number;
  maxScore: number;
  qTableSize: number;
}

/**
 * RL训练Hook
 */
export function useRLTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [stats, setStats] = useState<RLTrainingStats>({
    episode: 0,
    score: 0,
    steps: 0,
    epsilon: 1.0,
    averageScore: 0,
    maxScore: 0,
    qTableSize: 0,
  });

  const agentRef = useRef<QLearningAgent | null>(null);
  const episodeScoresRef = useRef<number[]>([]);
  const previousStateRef = useRef<GameState | null>(null);
  const currentStateRef = useRef<GameState | null>(null);

  // 初始化Agent
  useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = new QLearningAgent(defaultTrainingConfig);
    }
  }, []);

  /**
   * 开始训练
   */
  const startTraining = useCallback(() => {
    setIsTraining(true);
    episodeScoresRef.current = [];
    setStats((prev: RLTrainingStats) => ({
      ...prev,
      episode: 0,
      score: 0,
      steps: 0,
      epsilon: defaultTrainingConfig.epsilonStart,
    }));
  }, []);

  /**
   * 停止训练
   */
  const stopTraining = useCallback(() => {
    setIsTraining(false);
  }, []);

  /**
   * 训练一步
   */
  const trainStep = useCallback(
    (
      prevState: GameState,
      action: number,
      currentState: GameState,
      done: boolean
    ) => {
      if (!agentRef.current) return;

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

      // 学习
      agentRef.current.learn(
        stateVector,
        action,
        reward,
        nextStateVector,
        done
      );

      // 衰减探索率
      if (done) {
        agentRef.current.decayEpsilon();
      }
    },
    []
  );

  /**
   * 选择动作（用于RL模式）
   */
  const selectAction = useCallback(
    (state: GameState): { action: number; direction: Direction } => {
      if (!agentRef.current) {
        // 回退到简单规则
        const { snake, food, direction } = state;
        if (!food) {
          return { action: 0, direction };
        }
        const head = snake[snake.length - 1];
        const dx = food.x - head.x;
        const dy = food.y - head.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          return { action: dx > 0 ? 3 : 2, direction: { x: Math.sign(dx), y: 0 } };
        } else {
          return { action: dy > 0 ? 1 : 0, direction: { x: 0, y: Math.sign(dy) } };
        }
      }

      const stateVector = extractState(state).toArray();
      const action = agentRef.current.selectAction(stateVector);
      
      // 动作到方向的映射
      const actionToDirection: Direction[] = [
        { x: 0, y: -1 },  // 0: 上
        { x: 0, y: 1 },   // 1: 下
        { x: -1, y: 0 },  // 2: 左
        { x: 1, y: 0 },   // 3: 右
      ];

      return {
        action,
        direction: actionToDirection[action],
      };
    },
    []
  );

  /**
   * 更新统计信息
   */
  const updateStats = useCallback(
    (episode: number, score: number, steps: number) => {
      episodeScoresRef.current.push(score);
      
      // 只保留最近100局的分数
      if (episodeScoresRef.current.length > 100) {
        episodeScoresRef.current.shift();
      }

      const averageScore =
        episodeScoresRef.current.reduce((a: number, b: number) => a + b, 0) /
        episodeScoresRef.current.length;
      const maxScore = Math.max(...episodeScoresRef.current);

      setStats({
        episode,
        score,
        steps,
        epsilon: agentRef.current?.getEpsilon() || 0,
        averageScore,
        maxScore,
        qTableSize: agentRef.current?.getQTableSize() || 0,
      });
    },
    []
  );

  /**
   * 重置episode
   */
  const resetEpisode = useCallback(() => {
    previousStateRef.current = null;
    currentStateRef.current = null;
  }, []);

  return {
    isTraining,
    stats,
    startTraining,
    stopTraining,
    trainStep,
    selectAction,
    updateStats,
    resetEpisode,
    agent: agentRef.current,
  };
}


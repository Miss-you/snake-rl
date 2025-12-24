/**
 * RL推理Hook - 使用后端模型进行推理（不包含训练逻辑）
 * 训练逻辑应该在Python后端完成
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, Direction } from '@/lib/game/types';
import { RLAgent } from '@/lib/api/rlAgent';
import { apiClient } from '@/lib/api/client';
import type { TrainingStatus } from '@/lib/api/client';

/**
 * RL推理统计（从后端获取）
 */
export interface RLInferenceStats {
  episode: number;
  score: number;
  steps: number;
  averageScore: number;
  maxScore: number;
  epsilon?: number;
}

/**
 * RL推理Hook - 只负责推理，不负责训练
 */
export function useRLInference() {
  const [isInferenceMode, setIsInferenceMode] = useState(false);
  const [stats, setStats] = useState<RLInferenceStats>({
    episode: 0,
    score: 0,
    steps: 0,
    averageScore: 0,
    maxScore: 0,
  });
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);

  const agentRef = useRef<RLAgent | null>(null);
  const episodeStepsRef = useRef<number>(0);

  // 初始化Agent
  useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = new RLAgent();
      agentRef.current.setUseBackend(true);
      agentRef.current.setFallbackToLocal(true);
    }
  }, []);

  /**
   * 开始推理模式
   */
  const startInference = useCallback(async () => {
    setIsInferenceMode(true);
    episodeStepsRef.current = 0;
    
    // 尝试获取训练状态
    try {
      const status = await apiClient.getTrainingStatus();
      setTrainingStatus(status);
    } catch (error) {
      console.warn('无法获取训练状态:', error);
    }
  }, []);

  /**
   * 停止推理模式
   */
  const stopInference = useCallback(() => {
    setIsInferenceMode(false);
  }, []);

  /**
   * 选择动作（推理）
   */
  const selectAction = useCallback(
    async (state: GameState): Promise<Direction> => {
      if (!agentRef.current) {
        // 回退到简单规则
        const { snake, food, direction } = state;
        if (!food) {
          return direction;
        }
        const head = snake[snake.length - 1];
        const dx = food.x - head.x;
        const dy = food.y - head.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          return { x: Math.sign(dx), y: 0 };
        } else {
          return { x: 0, y: Math.sign(dy) };
        }
      }

      // 使用后端模型推理
      return await agentRef.current.selectAction(state);
    },
    []
  );

  /**
   * 更新统计信息
   */
  const updateStats = useCallback(
    async (episode: number, score: number, steps: number) => {
      setStats({
        episode,
        score,
        steps,
        averageScore: trainingStatus?.averageScore || 0,
        maxScore: trainingStatus?.maxScore || score,
        epsilon: trainingStatus?.epsilon,
      });

      // 尝试更新训练状态
      try {
        const status = await apiClient.getTrainingStatus();
        setTrainingStatus(status);
      } catch (error) {
        // 忽略错误
      }
    },
    [trainingStatus]
  );

  /**
   * 重置episode
   */
  const resetEpisode = useCallback(() => {
    episodeStepsRef.current = 0;
  }, []);

  return {
    isInferenceMode,
    stats,
    trainingStatus,
    startInference,
    stopInference,
    selectAction,
    updateStats,
    resetEpisode,
  };
}


'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, Direction, ControlMode } from '@/lib/game/types';
import {
  createInitialGameState,
  startGame,
  restartGame,
  setControlMode,
  endGame,
} from '@/lib/game/gameState';
import { updateSnakePosition, handleDirectionChange } from '@/lib/game/snake';
import { placeFood } from '@/lib/game/food';
import { checkCollision } from '@/lib/game/collision';
import { computeAIDirection } from '@/lib/game/ai';
import { config } from '@/lib/game/config';
import { useRLInference } from './useRLInference';
import { ExperienceCollector } from '@/lib/api/experienceCollector';

/**
 * 游戏主循环 Hook
 */
export function useGame() {
  const [state, setState] = useState<GameState>(() =>
    createInitialGameState('menu')
  );
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<ControlMode>('menu');
  
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const previousStateRef = useRef<GameState | null>(null);
  const episodeStepsRef = useRef<number>(0);
  const episodeRef = useRef<number>(0);
  const rlDirectionRef = useRef<Direction | null>(null);

  // RL推理Hook（只负责推理，训练在后端）
  const rlInference = useRLInference();
  const experienceCollectorRef = useRef<ExperienceCollector | null>(null);

  // 初始化经验收集器
  useEffect(() => {
    if (!experienceCollectorRef.current) {
      experienceCollectorRef.current = new ExperienceCollector(50); // 每50条经验发送一次
    }
  }, []);

  // 初始化食物
  useEffect(() => {
    if (!state.food) {
      setState(prev => ({
        ...prev,
        food: placeFood(prev.snake),
      }));
    }
  }, [state.food]);

  // RL推理：异步获取动作
  useEffect(() => {
    if (state.controlMode === 'rl' && rlInference.isInferenceMode && state.gameRunning) {
      rlInference.selectAction(state).then(direction => {
        rlDirectionRef.current = direction;
      }).catch(() => {
        // 如果后端不可用，使用简单规则
        const { snake, food, direction } = state;
        if (!food) {
          rlDirectionRef.current = direction;
          return;
        }
        const head = snake[snake.length - 1];
        const dx = food.x - head.x;
        const dy = food.y - head.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          rlDirectionRef.current = { x: Math.sign(dx), y: 0 };
        } else {
          rlDirectionRef.current = { x: 0, y: Math.sign(dy) };
        }
      });
    }
  }, [state.controlMode, state.gameRunning, state.snake, state.food, rlInference.isInferenceMode]);

  // 游戏主循环
  useEffect(() => {
    if (!state.gameRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const gameLoop = (timestamp: number) => {
      const lastTime = lastTimeRef.current || timestamp;
      lastTimeRef.current = timestamp;
      const delta = timestamp - lastTime;
      accumulatorRef.current += delta;

      while (accumulatorRef.current >= config.game.speedMs) {
        setState(prev => {
          let newState = { ...prev };

          // AI模式：更新下一步的方向决策
          if (newState.controlMode === 'ai') {
            const aiDirection = computeAIDirection(newState);
            newState = {
              ...newState,
              nextDirection: aiDirection,
            };
          }

          // RL推理模式：使用后端模型选择动作
          if (newState.controlMode === 'rl' && rlInference.isInferenceMode && rlDirectionRef.current) {
            newState = {
              ...newState,
              nextDirection: rlDirectionRef.current,
            };
          }

          // 更新蛇位置
          const prevStateForRL = newState.controlMode === 'rl' && rlInference.isInferenceMode 
            ? { ...newState } 
            : null;
          newState = updateSnakePosition(newState);

          // RL推理模式：收集经验并发送到后端（不在这里训练）
          if (prevStateForRL && previousStateRef.current && experienceCollectorRef.current) {
            episodeStepsRef.current++;
            const done = checkCollision(newState);
            
            // 计算动作索引（基于方向变化）
            const prevDir = previousStateRef.current.direction;
            const currDir = newState.direction;
            let action = 0;
            if (currDir.x === 1) action = 3; // 右
            else if (currDir.x === -1) action = 2; // 左
            else if (currDir.y === 1) action = 1; // 下
            else if (currDir.y === -1) action = 0; // 上
            
            // 记录经验（会批量发送到后端）
            experienceCollectorRef.current.recordStep(
              previousStateRef.current,
              action,
              newState,
              done
            );
          }

          // 检测碰撞
          if (checkCollision(newState)) {
            const endedState = endGame(newState);
            
            // RL推理模式：更新统计信息
            if (newState.controlMode === 'rl' && rlInference.isInferenceMode) {
              episodeRef.current++;
              rlInference.updateStats(
                episodeRef.current,
                endedState.score,
                episodeStepsRef.current
              );
              episodeStepsRef.current = 0;
              previousStateRef.current = null;
              rlInference.resetEpisode();
              
              // 确保经验已发送
              if (experienceCollectorRef.current) {
                experienceCollectorRef.current.flush();
              }
              
              // 自动重新开始
              setTimeout(() => {
                setState(prev => restartGame(createInitialGameState('rl')));
              }, 100);
            }
            
            return endedState;
          }
          
          // RL推理模式：保存当前状态用于下次经验收集
          if (newState.controlMode === 'rl' && rlInference.isInferenceMode) {
            previousStateRef.current = { ...newState };
          }

          accumulatorRef.current -= config.game.speedMs;
          return newState;
        });
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.gameRunning, state.controlMode, rlInference.isInferenceMode]);

  // 同步分数和模式到本地状态
  useEffect(() => {
    setScore(state.score);
    setMode(state.controlMode);
  }, [state.score, state.controlMode]);

  const handleStart = useCallback(() => {
    setState(prev => startGame(prev));
  }, []);

  const handleRestart = useCallback(() => {
    setState(prev => restartGame(prev));
  }, []);

  const handleSetControlMode = useCallback((mode: ControlMode) => {
    setState(prev => setControlMode(prev, mode));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 防止箭头键滚动页面
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          ' ',
          'Space',
        ].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          setState(prev => handleDirectionChange(prev, { x: 0, y: -1 }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setState(prev => handleDirectionChange(prev, { x: 0, y: 1 }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setState(prev => handleDirectionChange(prev, { x: -1, y: 0 }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setState(prev => handleDirectionChange(prev, { x: 1, y: 0 }));
          break;
        case 'Digit1': // 选择人工控制
          handleSetControlMode('manual');
          break;
        case 'Digit2': // 选择AI自动控制
          handleSetControlMode('ai');
          break;
        case 'Digit3': // 选择RL推理模式
          handleSetControlMode('rl');
          if (!rlInference.isInferenceMode) {
            rlInference.startInference();
          }
          break;
        case 'Space':
          if (!state.gameRunning) {
            if (state.gameOver) {
              handleRestart();
            } else {
              handleStart();
            }
          }
          break;
      }
    },
    [state.gameRunning, state.gameOver, handleStart, handleRestart, handleSetControlMode, rlInference]
  );

  // 绑定键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 当切换到RL模式时，自动开始推理
  useEffect(() => {
    if (mode === 'rl' && !rlInference.isInferenceMode) {
      rlInference.startInference();
    } else if (mode !== 'rl' && rlInference.isInferenceMode) {
      rlInference.stopInference();
    }
  }, [mode, rlInference]);

  return {
    state,
    score,
    mode,
    handleStart,
    handleRestart,
    handleSetControlMode,
    rlInference, // 暴露RL推理功能
  };
}

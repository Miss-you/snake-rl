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

  // 初始化食物
  useEffect(() => {
    if (!state.food) {
      setState(prev => ({
        ...prev,
        food: placeFood(prev.snake),
      }));
    }
  }, [state.food]);

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

          // 更新蛇位置
          newState = updateSnakePosition(newState);

          // 检测碰撞
          if (checkCollision(newState)) {
            return endGame(newState);
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
  }, [state.gameRunning, state.controlMode]);

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
    [state.gameRunning, state.gameOver, handleStart, handleRestart, handleSetControlMode]
  );

  // 绑定键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    state,
    score,
    mode,
    handleStart,
    handleRestart,
    handleSetControlMode,
  };
}


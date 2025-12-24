import type { GameState, Position, Direction, ControlMode } from './types';
import { config } from './config';

/**
 * 创建初始游戏状态
 */
export function createInitialGameState(controlMode: ControlMode = 'menu'): GameState {
  const centerX = Math.floor(config.grid.cols / 2);
  const centerY = Math.floor(config.grid.rows / 2);
  const snake: Position[] = [];
  
  // 将蛇放在画布中央并初始化长度
  for (let i = config.game.initialLength - 1; i >= 0; i--) {
    snake.push({ x: centerX - i, y: centerY });
  }

  const initialDirection: Direction = { x: 1, y: 0 };

  return {
    snake,
    direction: initialDirection,
    nextDirection: initialDirection,
    food: null,
    score: 0,
    gameRunning: false,
    gameOver: false,
    controlMode,
  };
}

/**
 * 更新游戏状态中的分数
 */
export function updateScore(state: GameState, delta: number): GameState {
  return {
    ...state,
    score: state.score + delta,
  };
}

/**
 * 设置控制模式
 */
export function setControlMode(state: GameState, mode: ControlMode): GameState {
  if (state.gameRunning) {
    return state; // 运行中不允许切换
  }
  return {
    ...state,
    controlMode: mode,
  };
}

/**
 * 开始游戏
 */
export function startGame(state: GameState): GameState {
  if (state.gameRunning) {
    return state;
  }
  
  let newState = { ...state };
  
  // 如果游戏结束，重新初始化
  if (state.gameOver) {
    newState = createInitialGameState(state.controlMode);
  }
  
  // 菜单模式下默认需要选择模式，若未选择则默认为人工控制
  if (newState.controlMode === 'menu') {
    newState = setControlMode(newState, 'manual');
  }
  
  return {
    ...newState,
    gameRunning: true,
  };
}

/**
 * 结束游戏
 */
export function endGame(state: GameState): GameState {
  return {
    ...state,
    gameOver: true,
    gameRunning: false,
  };
}

/**
 * 重新开始游戏
 */
export function restartGame(state: GameState): GameState {
  const newState = createInitialGameState(state.controlMode);
  return startGame(newState);
}


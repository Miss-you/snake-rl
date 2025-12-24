import {
  createInitialGameState,
  updateScore,
  setControlMode,
  startGame,
  endGame,
  restartGame,
} from '../gameState';
import type { ControlMode } from '../types';
import { config } from '../config';

describe('gameState', () => {
  describe('createInitialGameState', () => {
    it('应该创建正确的初始游戏状态', () => {
      const state = createInitialGameState();

      expect(state.snake).toBeDefined();
      expect(state.snake.length).toBe(config.game.initialLength);
      expect(state.direction).toEqual({ x: 1, y: 0 });
      expect(state.nextDirection).toEqual({ x: 1, y: 0 });
      expect(state.food).toBeNull();
      expect(state.score).toBe(0);
      expect(state.gameRunning).toBe(false);
      expect(state.gameOver).toBe(false);
    });

    it('应该将蛇放在画布中央', () => {
      const state = createInitialGameState();
      const centerX = Math.floor(config.grid.cols / 2);
      const centerY = Math.floor(config.grid.rows / 2);

      // 蛇的头部应该在中心附近
      const head = state.snake[state.snake.length - 1];
      expect(head.x).toBeGreaterThanOrEqual(centerX - config.game.initialLength);
      expect(head.x).toBeLessThanOrEqual(centerX);
      expect(head.y).toBe(centerY);
    });

    it('应该接受控制模式参数', () => {
      const modes: ControlMode[] = ['menu', 'manual', 'ai', 'rl'];
      modes.forEach((mode) => {
        const state = createInitialGameState(mode);
        expect(state.controlMode).toBe(mode);
      });
    });

    it('应该创建水平排列的蛇', () => {
      const state = createInitialGameState();
      const centerY = Math.floor(config.grid.rows / 2);

      // 所有蛇段应该在同一条水平线上
      state.snake.forEach((seg) => {
        expect(seg.y).toBe(centerY);
      });

      // 蛇段应该按x坐标递增排列
      for (let i = 1; i < state.snake.length; i++) {
        expect(state.snake[i].x).toBeGreaterThan(state.snake[i - 1].x);
      }
    });
  });

  describe('updateScore', () => {
    it('应该增加分数', () => {
      const state = createInitialGameState();
      state.score = 10;

      const newState = updateScore(state, 5);

      expect(newState.score).toBe(15);
    });

    it('应该能够减少分数', () => {
      const state = createInitialGameState();
      state.score = 10;

      const newState = updateScore(state, -3);

      expect(newState.score).toBe(7);
    });

    it('不应该修改其他状态', () => {
      const state = createInitialGameState();
      const originalSnake = [...state.snake];

      const newState = updateScore(state, 1);

      expect(newState.snake).toEqual(originalSnake);
      expect(newState.direction).toEqual(state.direction);
    });
  });

  describe('setControlMode', () => {
    it('应该在游戏未运行时允许切换模式', () => {
      const state = createInitialGameState();
      state.gameRunning = false;

      const newState = setControlMode(state, 'ai');

      expect(newState.controlMode).toBe('ai');
    });

    it('应该在游戏运行时禁止切换模式', () => {
      const state = createInitialGameState();
      state.gameRunning = true;
      const originalMode = state.controlMode;

      const newState = setControlMode(state, 'ai');

      expect(newState).toBe(state);
      expect(newState.controlMode).toBe(originalMode);
    });
  });

  describe('startGame', () => {
    it('应该启动游戏', () => {
      const state = createInitialGameState();
      state.gameRunning = false;

      const newState = startGame(state);

      expect(newState.gameRunning).toBe(true);
    });

    it('不应该重复启动已运行的游戏', () => {
      const state = createInitialGameState();
      state.gameRunning = true;

      const newState = startGame(state);

      expect(newState).toBe(state);
    });

    it('应该在游戏结束后重新初始化', () => {
      const state = createInitialGameState();
      state.gameOver = true;
      state.score = 100;
      state.snake = [{ x: 0, y: 0 }];

      const newState = startGame(state);

      expect(newState.gameOver).toBe(false);
      expect(newState.score).toBe(0);
      expect(newState.snake.length).toBe(config.game.initialLength);
    });

    it('应该在菜单模式下默认设置为手动控制', () => {
      const state = createInitialGameState('menu');

      const newState = startGame(state);

      expect(newState.controlMode).toBe('manual');
    });

    it('应该保持非菜单模式的控制模式', () => {
      const state = createInitialGameState('ai');

      const newState = startGame(state);

      expect(newState.controlMode).toBe('ai');
    });
  });

  describe('endGame', () => {
    it('应该结束游戏', () => {
      const state = createInitialGameState();
      state.gameRunning = true;
      state.gameOver = false;

      const newState = endGame(state);

      expect(newState.gameOver).toBe(true);
      expect(newState.gameRunning).toBe(false);
    });

    it('不应该修改其他状态', () => {
      const state = createInitialGameState();
      state.score = 50;
      const originalSnake = [...state.snake];

      const newState = endGame(state);

      expect(newState.score).toBe(50);
      expect(newState.snake).toEqual(originalSnake);
    });
  });

  describe('restartGame', () => {
    it('应该重新初始化并启动游戏', () => {
      const state = createInitialGameState();
      state.score = 100;
      state.gameOver = true;
      state.gameRunning = false;
      state.snake = [{ x: 0, y: 0 }];

      const newState = restartGame(state);

      expect(newState.score).toBe(0);
      expect(newState.gameOver).toBe(false);
      expect(newState.gameRunning).toBe(true);
      expect(newState.snake.length).toBe(config.game.initialLength);
    });

    it('应该保持控制模式', () => {
      const state = createInitialGameState('ai');
      state.controlMode = 'ai';

      const newState = restartGame(state);

      expect(newState.controlMode).toBe('ai');
    });
  });
});


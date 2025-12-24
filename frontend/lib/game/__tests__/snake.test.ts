import {
  updateSnakePosition,
  handleDirectionChange,
} from '../snake';
import type { GameState, Direction } from '../types';

describe('snake', () => {
  describe('updateSnakePosition', () => {
    it('应该正常移动蛇的位置（未吃到食物）', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 10, y: 10 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      // 头部应该向前移动
      expect(newState.snake[newState.snake.length - 1]).toEqual({
        x: 6,
        y: 5,
      });
      // 长度应该保持不变
      expect(newState.snake.length).toBe(3);
      // 方向应该更新
      expect(newState.direction).toEqual({ x: 1, y: 0 });
      expect(newState.nextDirection).toEqual({ x: 1, y: 0 });
    });

    it('应该增长蛇的长度当吃到食物', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
        ],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 6, y: 5 }, // 食物在下一个位置
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      // 蛇应该增长
      expect(newState.snake.length).toBe(3);
      // 分数应该增加
      expect(newState.score).toBe(1);
      // 应该生成新食物
      expect(newState.food).toBeDefined();
      expect(newState.food).not.toEqual({ x: 6, y: 5 });
    });

    it('应该正确应用nextDirection', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 0, y: 1 }, // 改变方向
        food: { x: 10, y: 10 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      // 应该向上移动（y增加）
      expect(newState.snake[newState.snake.length - 1]).toEqual({
        x: 5,
        y: 6,
      });
      // 方向应该更新为nextDirection
      expect(newState.direction).toEqual({ x: 0, y: 1 });
      expect(newState.nextDirection).toEqual({ x: 0, y: 1 });
    });

    it('应该正确处理向下移动', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 0, y: 1 },
        nextDirection: { x: 0, y: 1 },
        food: { x: 10, y: 10 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      expect(newState.snake[newState.snake.length - 1]).toEqual({
        x: 5,
        y: 6,
      });
    });

    it('应该正确处理向左移动', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: -1, y: 0 },
        nextDirection: { x: -1, y: 0 },
        food: { x: 10, y: 10 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      expect(newState.snake[newState.snake.length - 1]).toEqual({
        x: 4,
        y: 5,
      });
    });

    it('应该正确处理向上移动', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: { x: 10, y: 10 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newState = updateSnakePosition(state);

      expect(newState.snake[newState.snake.length - 1]).toEqual({
        x: 5,
        y: 4,
      });
    });
  });

  describe('handleDirectionChange', () => {
    it('应该允许改变方向', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newDirection: Direction = { x: 0, y: 1 };
      const newState = handleDirectionChange(state, newDirection);

      expect(newState.nextDirection).toEqual(newDirection);
    });

    it('应该禁止直接反向', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const oppositeDirection: Direction = { x: -1, y: 0 };
      const newState = handleDirectionChange(state, oppositeDirection);

      // 应该保持原状态不变
      expect(newState).toBe(state);
      expect(newState.nextDirection).toEqual({ x: 1, y: 0 });
    });

    it('应该禁止从向上直接反向到向下', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const oppositeDirection: Direction = { x: 0, y: 1 };
      const newState = handleDirectionChange(state, oppositeDirection);

      expect(newState).toBe(state);
    });

    it('应该允许从向右转向向上', () => {
      const state: GameState = {
        snake: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      const newDirection: Direction = { x: 0, y: -1 };
      const newState = handleDirectionChange(state, newDirection);

      expect(newState.nextDirection).toEqual(newDirection);
    });
  });
});


import { checkCollision, isCellSafe } from '../collision';
import type { GameState, Position } from '../types';
import { config } from '../config';

describe('collision', () => {
  describe('isCellSafe', () => {
    it('应该返回true当位置在边界内且不与蛇重叠', () => {
      const position: Position = { x: 5, y: 5 };
      const snake: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];

      expect(isCellSafe(position, snake)).toBe(true);
    });

    it('应该返回false当位置越界（左边界）', () => {
      const position: Position = { x: -1, y: 5 };
      const snake: Position[] = [];

      expect(isCellSafe(position, snake)).toBe(false);
    });

    it('应该返回false当位置越界（右边界）', () => {
      const position: Position = { x: config.grid.cols, y: 5 };
      const snake: Position[] = [];

      expect(isCellSafe(position, snake)).toBe(false);
    });

    it('应该返回false当位置越界（上边界）', () => {
      const position: Position = { x: 5, y: -1 };
      const snake: Position[] = [];

      expect(isCellSafe(position, snake)).toBe(false);
    });

    it('应该返回false当位置越界（下边界）', () => {
      const position: Position = { x: 5, y: config.grid.rows };
      const snake: Position[] = [];

      expect(isCellSafe(position, snake)).toBe(false);
    });

    it('应该返回false当位置与蛇重叠', () => {
      const position: Position = { x: 1, y: 0 };
      const snake: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];

      expect(isCellSafe(position, snake)).toBe(false);
    });
  });

  describe('checkCollision', () => {
    it('应该返回false当蛇在安全位置', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(false);
    });

    it('应该返回true当蛇撞到左墙', () => {
      const state: GameState = {
        snake: [
          { x: 0, y: 5 },
          { x: 1, y: 5 },
        ],
        direction: { x: -1, y: 0 },
        nextDirection: { x: -1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(true);
    });

    it('应该返回true当蛇撞到右墙', () => {
      const state: GameState = {
        snake: [
          { x: config.grid.cols - 1, y: 5 },
          { x: config.grid.cols - 2, y: 5 },
        ],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(true);
    });

    it('应该返回true当蛇撞到上墙', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 0 },
          { x: 5, y: 1 },
        ],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(true);
    });

    it('应该返回true当蛇撞到下墙', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: config.grid.rows - 1 },
          { x: 5, y: config.grid.rows - 2 },
        ],
        direction: { x: 0, y: 1 },
        nextDirection: { x: 0, y: 1 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(true);
    });

    it('应该返回true当蛇撞到自己', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 6, y: 6 },
          { x: 5, y: 6 },
          { x: 5, y: 5 }, // 头部与身体重叠
        ],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      expect(checkCollision(state)).toBe(true);
    });

    it('不应该将头部与最后一个身体段（原头部）视为碰撞', () => {
      const state: GameState = {
        snake: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'manual',
      };

      // 头部在(6,5)，最后一个身体段也在(6,5)，但这是正常的，不应该碰撞
      // 实际上checkCollision只检查snake.length - 1之前的段
      expect(checkCollision(state)).toBe(false);
    });
  });
});


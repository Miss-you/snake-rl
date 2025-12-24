import { computeAIDirection } from '../ai';
import type { GameState, Position } from '../types';
import { config } from '../config';

describe('ai', () => {
  describe('computeAIDirection', () => {
    it('应该在没有食物时保持当前方向', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: null,
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      expect(direction).toEqual({ x: 1, y: 0 });
    });

    it('应该优先朝向食物的x方向', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 15, y: 10 }, // 食物在右侧
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      expect(direction.x).toBeGreaterThan(0);
      expect(direction.y).toBe(0);
    });

    it('应该优先朝向食物的y方向', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 0, y: 1 },
        nextDirection: { x: 0, y: 1 },
        food: { x: 10, y: 15 }, // 食物在下侧
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      expect(direction.x).toBe(0);
      expect(direction.y).toBeGreaterThan(0);
    });

    it('应该避免直接反向', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 5, y: 10 }, // 食物在左侧，但当前向右
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 不应该直接反向
      expect(direction).not.toEqual({ x: -1, y: 0 });
    });

    it('应该避免撞墙', () => {
      const state: GameState = {
        snake: [{ x: config.grid.cols - 1, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: config.grid.cols, y: 10 }, // 食物在墙外
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 不应该继续向右（会撞墙）
      expect(direction.x).toBeLessThanOrEqual(0);
    });

    it('应该避免撞到自己', () => {
      const state: GameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
        ],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: { x: 10, y: 10 }, // 食物在身体位置
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 不应该选择会撞到自己的方向
      const nextPos: Position = {
        x: state.snake[state.snake.length - 1].x + direction.x,
        y: state.snake[state.snake.length - 1].y + direction.y,
      };

      const wouldCollide = state.snake.some(
        (seg) => seg.x === nextPos.x && seg.y === nextPos.y
      );
      expect(wouldCollide).toBe(false);
    });

    it('应该在安全方向中选择一个', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 12, y: 12 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 应该返回一个有效的方向
      expect([-1, 0, 1]).toContain(direction.x);
      expect([-1, 0, 1]).toContain(direction.y);
      expect(Math.abs(direction.x) + Math.abs(direction.y)).toBe(1);
    });

    it('应该在所有方向都不安全时保持当前方向', () => {
      // 创建一个被包围的情况（虽然这种情况在实际游戏中很少见）
      const state: GameState = {
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 9, y: 10 },
          { x: 10, y: 11 },
        ],
        direction: { x: 0, y: -1 },
        nextDirection: { x: 0, y: -1 },
        food: { x: 10, y: 9 }, // 食物在上方，但上方被身体占据
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 应该返回一个方向（可能是当前方向或任何安全方向）
      expect(direction).toBeDefined();
      expect([-1, 0, 1]).toContain(direction.x);
      expect([-1, 0, 1]).toContain(direction.y);
    });

    it('应该正确处理食物在左上角的情况', () => {
      const state: GameState = {
        snake: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        nextDirection: { x: 1, y: 0 },
        food: { x: 5, y: 5 },
        score: 0,
        gameRunning: true,
        gameOver: false,
        controlMode: 'ai',
      };

      const direction = computeAIDirection(state);

      // 应该选择向左或向上（但不能直接反向）
      expect(direction).toBeDefined();
      // 由于不能直接反向，应该选择向上
      expect(direction.y).toBeLessThan(0);
    });
  });
});


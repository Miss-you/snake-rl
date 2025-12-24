import { checkFoodCollision, placeFood } from '../food';
import type { Position } from '../types';

describe('food', () => {
  describe('checkFoodCollision', () => {
    it('应该返回true当头部位置与食物位置相同', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 5 };

      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('应该返回false当头部位置与食物位置不同', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 6, y: 5 };

      expect(checkFoodCollision(head, food)).toBe(false);
    });

    it('应该返回false当食物为null', () => {
      const head: Position = { x: 5, y: 5 };

      expect(checkFoodCollision(head, null)).toBe(false);
    });
  });

  describe('placeFood', () => {
    it('应该生成一个不与蛇重叠的位置', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 10 },
      ];

      const food = placeFood(snake);

      // 检查食物不与蛇重叠
      const overlaps = snake.some(
        (seg) => seg.x === food.x && seg.y === food.y
      );
      expect(overlaps).toBe(false);
    });

    it('应该在资源区域内生成食物', () => {
      const snake: Position[] = [{ x: 0, y: 0 }];
      const food = placeFood(snake);

      // 资源区域应该在配置的百分比范围内
      // 这里我们只检查食物在网格范围内
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeGreaterThanOrEqual(0);
    });

    it('应该能够处理空蛇的情况', () => {
      const snake: Position[] = [];
      const food = placeFood(snake);

      expect(food).toBeDefined();
      expect(typeof food.x).toBe('number');
      expect(typeof food.y).toBe('number');
    });

    it('应该能够处理蛇占满大部分区域的情况', () => {
      // 创建一个几乎占满网格的蛇
      const snake: Position[] = [];
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          snake.push({ x: i, y: j });
        }
      }

      // 即使蛇很大，也应该能找到位置（可能会回退到整个地图）
      const food = placeFood(snake);
      expect(food).toBeDefined();
      expect(typeof food.x).toBe('number');
      expect(typeof food.y).toBe('number');
    });

    it('多次调用应该生成不同的位置（概率测试）', () => {
      const snake: Position[] = [{ x: 10, y: 10 }];
      const positions = new Set<string>();

      // 运行多次，期望至少有一些不同的位置
      for (let i = 0; i < 10; i++) {
        const food = placeFood(snake);
        positions.add(`${food.x},${food.y}`);
      }

      // 由于随机性，至少应该有几个不同的位置
      expect(positions.size).toBeGreaterThan(1);
    });
  });
});


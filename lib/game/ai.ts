import type { Position, Direction, GameState } from './types';
import { config } from './config';
import { isCellSafe } from './collision';
import { checkFoodCollision } from './food';

/**
 * 基于泛洪填充的尾部可达性判断
 */
function isTailReachableFrom(
  newHead: Position,
  snake: Position[],
  food: Position | null,
  wouldEat: boolean
): boolean {
  const { cols, rows } = config.grid;
  const maxCells = config.ai.maxFloodCells;
  const tail = snake[0];
  
  // 构造占用集合（考虑尾巴是否移动）
  const occupied = new Set<string>();
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    occupied.add(`${seg.x},${seg.y}`);
  }
  
  // 新头位置视为占用
  occupied.add(`${newHead.x},${newHead.y}`);
  
  // 若不会吃到食物，下一步尾巴会移动，临时将尾格视为可通行
  if (!wouldEat) {
    occupied.delete(`${tail.x},${tail.y}`);
  }

  // BFS 从 newHead 出发，目标是 tail
  const q: Position[] = [newHead];
  const seen = new Set<string>([`${newHead.x},${newHead.y}`]);
  let explored = 0;
  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  
  while (q.length > 0 && explored < maxCells) {
    const cur = q.shift()!;
    explored++;
    
    if (cur.x === tail.x && cur.y === tail.y) {
      return true;
    }
    
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      if (occupied.has(key)) continue;
      
      seen.add(key);
      q.push({ x: nx, y: ny });
    }
  }
  
  return false;
}

/**
 * AI路径选择：优先朝向食物，避免墙与自身
 */
export function computeAIDirection(state: GameState): Direction {
  const { snake, direction, food } = state;
  const head = snake[snake.length - 1];
  
  if (!food) {
    return direction; // 没有食物时保持当前方向
  }
  
  const candidates: Direction[] = [];
  const dx = food.x - head.x;
  const dy = food.y - head.y;
  
  // 首选朝向食物的轴向
  if (dx !== 0) {
    candidates.push({ x: Math.sign(dx), y: 0 });
  }
  if (dy !== 0) {
    candidates.push({ x: 0, y: Math.sign(dy) });
  }
  
  // 备选：另外两个方向
  candidates.push({
    x: 0,
    y: dy === 0 ? (Math.random() < 0.5 ? 1 : -1) : 0,
  });
  candidates.push({
    x: dx === 0 ? (Math.random() < 0.5 ? 1 : -1) : 0,
    y: 0,
  });

  // 过滤直接反向与不安全方向
  let safeCandidates = candidates.filter(
    d => !(direction.x === -d.x && direction.y === -d.y)
  ).filter(d => {
    const nextPos: Position = { x: head.x + d.x, y: head.y + d.y };
    return isCellSafe(nextPos, snake);
  });

  // 尾部可达性优先：进一步过滤不可达尾部的候选
  if (config.ai.enableTailReachability && safeCandidates.length > 0) {
    const filtered: Direction[] = [];
    for (const d of safeCandidates) {
      const newHead: Position = { x: head.x + d.x, y: head.y + d.y };
      const wouldEat = checkFoodCollision(newHead, food);
      if (isTailReachableFrom(newHead, snake, food, wouldEat)) {
        filtered.push(d);
      }
    }
    if (filtered.length > 0) {
      safeCandidates = filtered;
    }
  }
  
  if (safeCandidates.length > 0) {
    return safeCandidates[0];
  }
  
  // 若没有安全方向，尝试所有方向中任意安全的
  const allDirs: Direction[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  
  const anySafe = allDirs
    .filter(d => !(direction.x === -d.x && direction.y === -d.y))
    .filter(d => {
      const nextPos: Position = { x: head.x + d.x, y: head.y + d.y };
      return isCellSafe(nextPos, snake);
    });
  
  if (anySafe.length > 0) {
    return anySafe[0];
  }
  
  // 若没有安全方向，保持当前方向
  return direction;
}


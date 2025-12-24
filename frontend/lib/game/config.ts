import type { GameConfig, GameSpeedConfig } from './types';

/**
 * 游戏配置
 * 可在现场修改这些参数以演示效果变化
 */
export const config: GameConfig = {
  grid: {
    cols: 24,
    rows: 24,
    cellSize: 22,
  },
  game: {
    speedMs: 120,
    initialLength: 4,
  },
  visuals: {
    radius: 6,
    shadowBlur: 12,
  },
  resourceArea: {
    // 资源（食物）生成区域百分比，可调整
    xMinPercent: 0.30,
    xMaxPercent: 0.70,
    yMinPercent: 0.40,
    yMaxPercent: 0.60,
  },
  ai: {
    // AI参数：尾部可达性检查
    enableTailReachability: true,
    maxFloodCells: 220,
  },
  colors: {
    canvasBg: '#0f141b',
    text: '#e6edf3',
    score: '#c9d1d9',
    snakeHead: '#1f6feb',
    snakeBody: '#58a6ff',
    food: '#ff7b72',
    snakeGlow: 'rgba(88,166,255,0.45)',
    foodGlow: 'rgba(255,123,114,0.45)',
    gameOverText: '#f0d0d0',
  },
};


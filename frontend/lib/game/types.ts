/**
 * 游戏相关的类型定义
 */

export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export type ControlMode = 'menu' | 'manual' | 'ai' | 'rl';

export interface GameState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position | null;
  score: number;
  gameRunning: boolean;
  gameOver: boolean;
  controlMode: ControlMode;
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;
}

export interface GameSpeedConfig {
  speedMs: number;
  initialLength: number;
}

export interface VisualsConfig {
  radius: number;
  shadowBlur: number;
}

export interface ResourceAreaConfig {
  xMinPercent: number;
  xMaxPercent: number;
  yMinPercent: number;
  yMaxPercent: number;
}

export interface AIConfig {
  enableTailReachability: boolean;
  maxFloodCells: number;
}

export interface ColorsConfig {
  canvasBg: string;
  text: string;
  score: string;
  snakeHead: string;
  snakeBody: string;
  food: string;
  snakeGlow: string;
  foodGlow: string;
  gameOverText: string;
}

export interface GameConfig {
  grid: GridConfig;
  game: GameSpeedConfig;
  visuals: VisualsConfig;
  resourceArea: ResourceAreaConfig;
  ai: AIConfig;
  colors: ColorsConfig;
}


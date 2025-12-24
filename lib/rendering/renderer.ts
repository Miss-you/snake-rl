import type { Position, GameState } from '../game/types';
import { config } from '../game/config';

/**
 * 渲染器类，负责在 Canvas 上绘制游戏画面
 */
export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }
    this.ctx = ctx;
  }

  /**
   * 绘制单个带圆角的格子（蛇身体）
   */
  private drawRoundedCell(
    px: number,
    py: number,
    size: number,
    color: string,
    glowColor: string,
    isHead = false
  ): void {
    const r = config.visuals.radius;
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = isHead
      ? config.visuals.shadowBlur + 4
      : config.visuals.shadowBlur;
    this.ctx.shadowColor = glowColor;
    this.ctx.beginPath();
    this.ctx.moveTo(px + r, py);
    this.ctx.lineTo(px + size - r, py);
    this.ctx.quadraticCurveTo(px + size, py, px + size, py + r);
    this.ctx.lineTo(px + size, py + size - r);
    this.ctx.quadraticCurveTo(px + size, py + size, px + size - r, py + size);
    this.ctx.lineTo(px + r, py + size);
    this.ctx.quadraticCurveTo(px, py + size, px, py + size - r);
    this.ctx.lineTo(px, py + r);
    this.ctx.quadraticCurveTo(px, py, px + r, py);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * 绘制食物（使用圆形带发光）
   */
  private drawFoodCell(px: number, py: number, size: number): void {
    const radius = Math.floor(size / 2) - 2;
    this.ctx.save();
    this.ctx.fillStyle = config.colors.food;
    this.ctx.shadowBlur = config.visuals.shadowBlur + 2;
    this.ctx.shadowColor = config.colors.foodGlow;
    this.ctx.beginPath();
    this.ctx.arc(px + size / 2, py + size / 2, radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * 在画布中央显示 Game Over 与最终分数
   */
  private drawGameOver(score: number): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 18;
    this.ctx.shadowColor = 'rgba(240, 208, 208, 0.6)';
    this.ctx.fillStyle = config.colors.gameOverText;
    this.ctx.font = 'bold 34px system-ui, -apple-system, Segoe UI, Roboto';
    this.ctx.fillText('Game Over', centerX, centerY - 14);
    this.ctx.font = '500 18px system-ui, -apple-system, Segoe UI, Roboto';
    this.ctx.fillText(`最终得分：${score}`, centerX, centerY + 20);
    this.ctx.fillText('按 1 人工 / 2 AI，空格重新开始', centerX, centerY + 46);
    this.ctx.restore();
  }

  /**
   * 菜单界面：提示模式选择
   */
  private drawModeMenu(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 16;
    this.ctx.shadowColor = 'rgba(88, 166, 255, 0.5)';
    this.ctx.fillStyle = config.colors.text;
    this.ctx.font = 'bold 28px system-ui, -apple-system, Segoe UI, Roboto';
    this.ctx.fillText('选择控制模式', centerX, centerY - 24);
    this.ctx.font = '500 18px system-ui, -apple-system, Segoe UI, Roboto';
    this.ctx.fillText('按 1 人工控制 / 按 2 AI自动控制', centerX, centerY + 6);
    this.ctx.fillText('按空格开始', centerX, centerY + 32);
    this.ctx.restore();
  }

  /**
   * 渲染主函数：清屏、绘制蛇与食物、绘制分数/游戏结束文案
   */
  render(state: GameState): void {
    const { cellSize } = config.grid;
    
    // 清屏
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 背景填充（增强对比度）
    this.ctx.save();
    this.ctx.fillStyle = config.colors.canvasBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // 绘制食物
    if (state.food) {
      const fx = state.food.x * cellSize;
      const fy = state.food.y * cellSize;
      this.drawFoodCell(fx, fy, cellSize);
    }

    // 绘制蛇
    for (let i = 0; i < state.snake.length; i++) {
      const seg = state.snake[i];
      const px = seg.x * cellSize;
      const py = seg.y * cellSize;
      const isHead = i === state.snake.length - 1;
      const color = isHead ? config.colors.snakeHead : config.colors.snakeBody;
      this.drawRoundedCell(
        px,
        py,
        cellSize,
        color,
        config.colors.snakeGlow,
        isHead
      );
    }

    // 绘制菜单或游戏结束提示
    if (state.controlMode === 'menu') {
      this.drawModeMenu();
    }
    if (state.gameOver) {
      this.drawGameOver(state.score);
    }
  }
}


'use client';

import { useEffect, useRef } from 'react';
import type { GameState } from '@/lib/game/types';
import { GameRenderer } from '@/lib/rendering/renderer';
import { config } from '@/lib/game/config';

interface GameCanvasProps {
  state: GameState;
}

export function GameCanvas({ state }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // 初始化 Canvas 和渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置画布尺寸
    canvas.width = config.grid.cols * config.grid.cellSize;
    canvas.height = config.grid.rows * config.grid.cellSize;

    // 创建渲染器
    rendererRef.current = new GameRenderer(canvas);
  }, []);

  // 渲染游戏画面
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(state);
    }
  }, [state]);

  return <canvas ref={canvasRef} id="gameCanvas" />;
}


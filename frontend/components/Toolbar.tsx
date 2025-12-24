'use client';

import type { ControlMode } from '@/lib/game/types';

interface ToolbarProps {
  mode: ControlMode;
  score: number;
  onStart: () => void;
  onRestart: () => void;
}

export function Toolbar({ mode, score, onStart, onRestart }: ToolbarProps) {
  const modeText =
    mode === 'menu' ? '菜单' 
    : mode === 'manual' ? '人工' 
    : mode === 'ai' ? 'AI' 
    : mode === 'rl' ? 'RL推理' 
    : '未知';

  return (
    <div className="toolbar">
      <div className="mode">
        模式：<span>{modeText}</span>
      </div>
      <div className="score">
        分数：<span>{score}</span>
      </div>
      <button className="btn" onClick={onStart}>
        开始游戏
      </button>
      <button className="btn" onClick={onRestart}>
        重新开始
      </button>
    </div>
  );
}


'use client';

import { GameCanvas } from '@/components/GameCanvas';
import { Toolbar } from '@/components/Toolbar';
import { useGame } from '@/hooks/useGame';

export default function Home() {
  const { state, score, mode, handleStart, handleRestart } = useGame();

  return (
    <div className="layout">
      <Toolbar
        mode={mode}
        score={score}
        onStart={handleStart}
        onRestart={handleRestart}
      />
      <GameCanvas state={state} />
      <div className="hint">方向键或 WASD 控制；空格开始/重新开始</div>
    </div>
  );
}


'use client';

import { GameCanvas } from '@/components/GameCanvas';
import { Toolbar } from '@/components/Toolbar';
import { RLInferencePanel } from '@/components/RLInferencePanel';
import { useGame } from '@/hooks/useGame';

export default function Home() {
  const { state, score, mode, handleStart, handleRestart, rlInference } = useGame();

  return (
    <div className="layout">
      <Toolbar
        mode={mode}
        score={score}
        onStart={handleStart}
        onRestart={handleRestart}
      />
      <GameCanvas state={state} />
      <div className="hint">
        方向键或 WASD 控制；空格开始/重新开始
        <br />
        按 1 人工控制 / 2 AI模式 / 3 RL推理模式（训练在后端）
      </div>
      {mode === 'rl' && rlInference && (
        <RLInferencePanel
          stats={rlInference.stats}
          trainingStatus={rlInference.trainingStatus}
          isInferenceMode={rlInference.isInferenceMode}
          onStart={rlInference.startInference}
          onStop={rlInference.stopInference}
        />
      )}
    </div>
  );
}


/**
 * RL推理面板组件 - 显示推理统计信息（训练在后端）
 */

'use client';

import type { RLInferenceStats } from '../hooks/useRLInference';
import type { TrainingStatus } from '../lib/api/client';

interface RLInferencePanelProps {
  stats: RLInferenceStats;
  trainingStatus: TrainingStatus | null;
  isInferenceMode: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RLInferencePanel({
  stats,
  trainingStatus,
  isInferenceMode,
  onStart,
  onStop,
}: RLInferencePanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#111826',
        border: '1px solid #2b3240',
        borderRadius: '10px',
        padding: '16px',
        minWidth: '250px',
        fontSize: '13px',
        color: '#e6edf3',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>
        🤖 RL推理面板
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>推理状态:</span>
          <span style={{ color: isInferenceMode ? '#58a6ff' : '#ff7b72' }}>
            {isInferenceMode ? '运行中' : '已停止'}
          </span>
        </div>
      </div>

      {trainingStatus && (
        <div style={{ marginBottom: '8px', padding: '8px', background: '#1a1f2e', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>后端训练状态</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ opacity: 0.8 }}>训练中:</span>
            <span style={{ color: trainingStatus.isTraining ? '#58a6ff' : '#ff7b72' }}>
              {trainingStatus.isTraining ? '是' : '否'}
            </span>
          </div>
          {trainingStatus.isTraining && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ opacity: 0.8 }}>Episode:</span>
                <span>{trainingStatus.currentEpisode}/{trainingStatus.totalEpisodes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.8 }}>平均分数:</span>
                <span>{trainingStatus.averageScore.toFixed(1)}</span>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>当前分数:</span>
          <span>{stats.score}</span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>平均分数:</span>
          <span>{stats.averageScore.toFixed(1)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>最高分数:</span>
          <span>{stats.maxScore}</span>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>步数:</span>
          <span>{stats.steps}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isInferenceMode ? (
          <button
            onClick={onStart}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#1f6feb',
              color: '#e6edf3',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            开始推理
          </button>
        ) : (
          <button
            onClick={onStop}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#ff7b72',
              color: '#e6edf3',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            停止推理
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #2b3240',
          fontSize: '11px',
          opacity: 0.6,
        }}
      >
        提示: 按 3 切换到RL推理模式
        <br />
        训练在后端进行，前端只负责推理
      </div>
    </div>
  );
}


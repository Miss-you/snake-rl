/**
 * RL训练面板组件 - 显示训练统计信息
 */

'use client';

import type { RLTrainingStats } from '../hooks/useRLTraining';

interface RLTrainingPanelProps {
  stats: RLTrainingStats;
  isTraining: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RLTrainingPanel({
  stats,
  isTraining,
  onStart,
  onStop,
}: RLTrainingPanelProps) {
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
        🤖 RL训练面板
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>训练状态:</span>
          <span style={{ color: isTraining ? '#58a6ff' : '#ff7b72' }}>
            {isTraining ? '训练中' : '已停止'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>Episode:</span>
          <span>{stats.episode}</span>
        </div>
      </div>

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

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>探索率 (ε):</span>
          <span>{(stats.epsilon * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.8 }}>Q表大小:</span>
          <span>{stats.qTableSize}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isTraining ? (
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
            开始训练
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
            停止训练
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
        提示: 按 3 切换到RL训练模式
      </div>
    </div>
  );
}


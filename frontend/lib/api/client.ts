/**
 * API客户端 - 与后端通信
 */

import type { Experience } from '../rl/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API响应基础类型
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 经验提交响应
 */
interface ExperienceResponse {
  success: boolean;
  count: number;
  message: string;
}

/**
 * 训练状态
 */
export interface TrainingStatus {
  isTraining: boolean;
  currentEpisode: number;
  totalEpisodes: number;
  averageScore: number;
  maxScore: number;
  currentLoss?: number;
  epsilon: number;
}

/**
 * 预测响应
 */
export interface PredictionResponse {
  action: number;
  qValues: number[];
  confidence: number;
}

/**
 * 模型信息
 */
export interface ModelInfo {
  version: string;
  createdAt: string;
  downloadUrl: string;
  metadata: {
    averageScore: number;
    maxScore: number;
    episodes: number;
  };
}

/**
 * API客户端类
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * 提交经验数据
   */
  async submitExperience(experiences: Experience[]): Promise<ExperienceResponse> {
    return this.request<ExperienceResponse>('/api/experience', {
      method: 'POST',
      body: JSON.stringify({ experiences }),
    });
  }

  /**
   * 获取经验数量
   */
  async getExperienceCount(): Promise<{ count: number; capacity: number; isReady: boolean }> {
    return this.request('/api/experience/count');
  }

  /**
   * 预测动作（推理）
   */
  async predictAction(state: number[]): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  }

  /**
   * 开始训练
   */
  async startTraining(episodes: number): Promise<{ success: boolean; trainingId: string; message: string }> {
    return this.request('/api/train', {
      method: 'POST',
      body: JSON.stringify({ episodes }),
    });
  }

  /**
   * 获取训练状态
   */
  async getTrainingStatus(): Promise<TrainingStatus> {
    return this.request<TrainingStatus>('/api/train/status');
  }

  /**
   * 获取最新模型信息
   */
  async getLatestModel(): Promise<ModelInfo> {
    return this.request<ModelInfo>('/api/model/latest');
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; version: string; replayBufferSize: number }> {
    return this.request('/api/health');
  }
}

// 导出单例实例
export const apiClient = new ApiClient();


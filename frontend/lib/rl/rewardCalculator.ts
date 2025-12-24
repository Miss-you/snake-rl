/**
 * 奖励计算器：根据游戏事件计算奖励
 */

import type { GameState, Position } from '../game/types';
import type { TrainingConfig } from './types';
import { checkFoodCollision } from '../game/food';
import { checkCollision } from '../game/collision';
import { config } from '../game/config';

/**
 * 计算奖励
 */
export function calculateReward(
  prevState: GameState,
  currentState: GameState,
  actionTaken: boolean,
  config: TrainingConfig
): number {
  let reward = 0;
  
  // 1. 吃到食物：大正奖励
  if (currentState.score > prevState.score) {
    reward += config.rewardEatFood;
  }
  
  // 2. 撞墙或撞自己：大负奖励
  if (checkCollision(currentState)) {
    if (currentState.gameOver) {
      // 判断是撞墙还是撞自己
      const { cols, rows } = config.grid;
      const head = currentState.snake[currentState.snake.length - 1];
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        reward += config.rewardHitWall;
      } else {
        reward += config.rewardHitSelf;
      }
    }
    return reward;
  }
  
  // 3. 存活奖励（鼓励探索）
  reward += config.rewardSurvive;
  
  // 4. 移动方向奖励（可选）
  if (currentState.food && prevState.food) {
    const prevHead = prevState.snake[prevState.snake.length - 1];
    const currHead = currentState.snake[currentState.snake.length - 1];
    const food = currentState.food;
    
    const prevDist = Math.abs(prevHead.x - food.x) + Math.abs(prevHead.y - food.y);
    const currDist = Math.abs(currHead.x - food.x) + Math.abs(currHead.y - food.y);
    
    if (currDist < prevDist) {
      reward += config.rewardMoveTowardsFood;
    } else if (currDist > prevDist) {
      reward -= config.rewardMoveTowardsFood;
    }
  }
  
  return reward;
}



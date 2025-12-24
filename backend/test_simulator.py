"""
测试游戏模拟器
"""

from app.services.game.simulator import GameSimulator
from app.services.game.state import extract_state


def test_simulator():
    """测试游戏模拟器基本功能"""
    print("测试游戏模拟器...")
    
    # 创建模拟器
    simulator = GameSimulator()
    
    # 重置游戏
    state = simulator.reset()
    print(f"初始状态: 分数={state.score}, 蛇长度={len(state.snake)}, 食物位置={state.food}")
    
    # 执行几步
    for i in range(10):
        action = i % 4  # 循环动作
        state, reward, done = simulator.step(action)
        state_vector = extract_state(state, grid_cols=24, grid_rows=24)
        print(f"步骤 {i+1}: 动作={action}, 奖励={reward:.2f}, 分数={state.score}, 状态向量维度={len(state_vector)}")
        
        if done:
            print("游戏结束!")
            break
    
    print("测试完成!")


if __name__ == "__main__":
    test_simulator()


"""
pytest配置和共享fixtures
"""

import pytest
import numpy as np
from app.services.game.simulator import GameSimulator, GameConfig, Position, Direction
from app.services.rl.replay_buffer import ReplayBuffer
from app.models.experience import Experience


@pytest.fixture
def game_config():
    """游戏配置fixture"""
    return GameConfig(
        grid_cols=24,
        grid_rows=24,
        initial_length=4
    )


@pytest.fixture
def game_simulator(game_config):
    """游戏模拟器fixture"""
    return GameSimulator(config=game_config)


@pytest.fixture
def replay_buffer():
    """经验回放缓冲区fixture"""
    return ReplayBuffer(capacity=1000)


@pytest.fixture
def sample_experience():
    """示例经验数据fixture"""
    return Experience(
        state=[0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 1, 0],
        action=3,
        reward=0.1,
        nextState=[0.52, 0.5, 0.08, 0.1, 0, 0, 0, 0, 0, 1, 0],
        done=False
    )


@pytest.fixture
def sample_state_vector():
    """示例状态向量fixture"""
    return np.array([0.5, 0.5, 0.1, 0.1, 0, 0, 0, 0, 0, 1, 0])


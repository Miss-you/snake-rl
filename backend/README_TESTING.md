# 测试和代码质量检查指南

本项目包含了完整的测试套件和代码质量检查工具。

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行测试

### 运行所有测试
```bash
pytest tests/ -v
```

### 运行测试并生成覆盖率报告
```bash
pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html
```

覆盖率报告会生成在 `htmlcov/index.html`

### 使用便捷脚本
```bash
bash scripts/test.sh
```

## 代码质量检查

### 运行所有检查
```bash
bash scripts/check-all.sh
```

### 单独运行各项检查

#### 代码格式化检查 (black)
```bash
black --check app tests
```

#### 格式化代码
```bash
black app tests
```

#### 导入排序检查 (isort)
```bash
isort --check-only app tests
```

#### 排序导入
```bash
isort app tests
```

#### 代码风格检查 (flake8)
```bash
flake8 app tests
```

#### 代码质量检查 (pylint)
```bash
pylint app
```

#### 类型检查 (mypy)
```bash
mypy app --ignore-missing-imports
```

### 使用便捷脚本
```bash
# 检查代码质量
bash scripts/lint.sh

# 格式化代码
bash scripts/format.sh
```

## 测试覆盖的核心模块

1. **GameSimulator** (`tests/test_game_simulator.py`)
   - 游戏初始化
   - 移动和碰撞检测
   - 食物生成和碰撞
   - 游戏状态管理

2. **State Extractor** (`tests/test_state.py`)
   - 状态向量提取
   - 方向编码
   - 危险检测
   - 方向旋转

3. **ReplayBuffer** (`tests/test_replay_buffer.py`)
   - 经验存储
   - 批量采样
   - 容量管理

4. **DQN** (`tests/test_dqn.py`)
   - 网络前向传播
   - 动作选择（探索/利用）
   - 训练步骤
   - 模型保存/加载

## CI/CD

项目包含 GitHub Actions CI 配置 (`.github/workflows/ci.yml`)，会在以下情况自动运行：
- Push 到 main 或 develop 分支
- 创建 Pull Request

CI 会运行：
- 代码格式化检查
- 代码风格检查
- 类型检查
- 单元测试
- 覆盖率报告

## 配置文件说明

- `.pylintrc` - Pylint 配置
- `.flake8` - Flake8 配置
- `mypy.ini` - MyPy 类型检查配置
- `pyproject.toml` - Black 和 isort 配置
- `pytest.ini` - Pytest 配置

## 编写新测试

1. 在 `tests/` 目录下创建 `test_*.py` 文件
2. 使用 pytest fixtures（定义在 `conftest.py`）
3. 遵循命名规范：`test_<功能描述>`
4. 添加适当的文档字符串

示例：
```python
def test_my_feature():
    """测试我的功能"""
    # 测试代码
    assert result == expected
```


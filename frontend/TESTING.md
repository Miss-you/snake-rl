# 测试和代码质量指南

本项目已配置了完整的代码质量检查和测试工具。

## 代码质量工具

### ESLint

ESLint用于代码静态分析和质量检查。

**运行检查：**
```bash
npm run lint
```

**自动修复：**
```bash
npm run lint:fix
```

### Prettier

Prettier用于代码格式化，确保代码风格一致。

**格式化所有文件：**
```bash
npm run format
```

**检查格式：**
```bash
npm run format:check
```

## 单元测试

### 运行测试

**运行所有测试：**
```bash
npm test
```

**监听模式（开发时推荐）：**
```bash
npm run test:watch
```

**生成覆盖率报告：**
```bash
npm run test:coverage
```

### 测试覆盖范围

当前测试覆盖以下核心模块：

- **collision.ts** - 碰撞检测逻辑
  - `isCellSafe` - 检查单元格是否安全
  - `checkCollision` - 检查碰撞（墙和自身）

- **food.ts** - 食物相关逻辑
  - `checkFoodCollision` - 检查是否吃到食物
  - `placeFood` - 随机放置食物

- **snake.ts** - 蛇的移动逻辑
  - `updateSnakePosition` - 更新蛇的位置
  - `handleDirectionChange` - 处理方向改变

- **gameState.ts** - 游戏状态管理
  - `createInitialGameState` - 创建初始状态
  - `updateScore` - 更新分数
  - `setControlMode` - 设置控制模式
  - `startGame` - 开始游戏
  - `endGame` - 结束游戏
  - `restartGame` - 重新开始游戏

- **ai.ts** - AI决策逻辑
  - `computeAIDirection` - 计算AI方向

### 覆盖率要求

项目设置了最低覆盖率要求：
- 分支覆盖率：70%
- 函数覆盖率：70%
- 行覆盖率：70%
- 语句覆盖率：70%

## 开发工作流建议

1. **开发前**：运行 `npm run lint` 和 `npm run format:check` 确保代码质量
2. **开发中**：使用 `npm run test:watch` 持续运行测试
3. **提交前**：运行 `npm run lint:fix` 和 `npm run format` 自动修复问题
4. **CI/CD**：运行 `npm test` 和 `npm run lint` 确保所有检查通过

## 添加新测试

测试文件应放在对应源文件的 `__tests__` 目录下，命名格式为 `*.test.ts` 或 `*.spec.ts`。

示例：
```
lib/game/snake.ts
lib/game/__tests__/snake.test.ts
```

## 注意事项

- 测试应该独立，不依赖外部状态
- 使用描述性的测试名称
- 每个测试应该只测试一个功能点
- 优先测试核心业务逻辑


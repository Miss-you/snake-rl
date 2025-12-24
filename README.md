# 贪吃蛇游戏 - Next.js + TypeScript

一个使用 Next.js 14、TypeScript 和 Canvas API 构建的现代化贪吃蛇游戏。

## 项目结构

```
snake-demo/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── GameCanvas.tsx     # 游戏画布组件
│   └── Toolbar.tsx        # 工具栏组件
├── hooks/                 # 自定义 Hooks
│   └── useGame.ts         # 游戏主循环 Hook
├── lib/                   # 核心逻辑库
│   ├── game/             # 游戏逻辑模块
│   │   ├── types.ts      # 类型定义
│   │   ├── config.ts     # 游戏配置
│   │   ├── gameState.ts  # 游戏状态管理
│   │   ├── snake.ts      # 蛇的移动逻辑
│   │   ├── food.ts       # 食物生成逻辑
│   │   ├── collision.ts  # 碰撞检测
│   │   └── ai.ts         # AI 决策逻辑
│   └── rendering/        # 渲染模块
│       └── renderer.ts   # Canvas 渲染器
├── docs/                  # 文档
│   └── snake-ai.md       # AI 算法说明
├── package.json
├── tsconfig.json
├── next.config.js
└── .gitignore
```

## 特性

- ✅ **TypeScript** - 完整的类型安全
- ✅ **模块化设计** - 清晰的代码组织，便于维护
- ✅ **Next.js 14** - 使用最新的 App Router
- ✅ **AI 模式** - 智能贪吃蛇 AI，支持尾部可达性检查
- ✅ **人工控制** - 支持方向键和 WASD 控制
- ✅ **现代化 UI** - 深色主题，流畅动画

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看游戏。

### 构建生产版本

```bash
npm run build
npm start
```

## 游戏控制

- **方向键** 或 **WASD** - 控制蛇的移动方向
- **空格键** - 开始/重新开始游戏
- **1** - 切换到人工控制模式
- **2** - 切换到 AI 自动控制模式

## 代码架构说明

### 游戏逻辑模块 (`lib/game/`)

- **types.ts** - 定义所有游戏相关的 TypeScript 类型
- **config.ts** - 游戏配置（网格大小、速度、颜色等）
- **gameState.ts** - 游戏状态管理函数
- **snake.ts** - 蛇的移动和方向处理逻辑
- **food.ts** - 食物的生成和碰撞检测
- **collision.ts** - 碰撞检测（墙壁和自身）
- **ai.ts** - AI 决策算法，包括尾部可达性检查

### 渲染模块 (`lib/rendering/`)

- **renderer.ts** - Canvas 渲染器类，负责绘制游戏画面

### React 组件 (`components/`)

- **GameCanvas.tsx** - 游戏画布组件，管理 Canvas 元素
- **Toolbar.tsx** - 工具栏组件，显示分数和控制按钮

### Hooks (`hooks/`)

- **useGame.ts** - 游戏主循环 Hook，管理游戏状态和事件处理

## 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Canvas API** - 游戏渲染
- **React Hooks** - 状态管理

## 开发计划

- [ ] 添加强化学习算法
- [ ] 添加游戏难度选择
- [ ] 添加排行榜功能
- [ ] 添加音效和背景音乐

## 许可证

MIT


# 脚本说明

本目录包含项目启动和停止脚本。

## 脚本列表

### start-all.sh

启动所有服务（前端和后端）。

**使用方法**：
```bash
./scripts/start-all.sh
```

**功能**：
- 检查并安装前端依赖（如果需要）
- 检查并创建后端虚拟环境（如果需要）
- 创建环境变量文件（如果不存在）
- 启动前端服务（http://localhost:3000）
- 启动后端服务（http://localhost:8000）
- 保存进程ID到 `scripts/pids/` 目录
- 保存日志到 `scripts/pids/` 目录

**停止方法**：
- 按 `Ctrl+C` 自动停止
- 或运行 `./scripts/stop-all.sh`

### stop-all.sh

停止所有服务。

**使用方法**：
```bash
./scripts/stop-all.sh
```

**功能**：
- 读取PID文件并停止前端服务
- 读取PID文件并停止后端服务
- 清理端口占用（3000和8000）
- 删除PID文件

## 目录结构

```
scripts/
├── start-all.sh      # 启动脚本
├── stop-all.sh       # 停止脚本
├── pids/             # PID文件目录（自动创建）
│   ├── frontend.pid  # 前端进程ID
│   ├── backend.pid   # 后端进程ID
│   ├── frontend.log  # 前端日志
│   └── backend.log   # 后端日志
└── README.md         # 本文件
```

## 注意事项

1. **首次运行**：脚本会自动安装依赖和创建虚拟环境，可能需要一些时间
2. **日志文件**：服务日志保存在 `scripts/pids/` 目录
3. **端口占用**：如果端口被占用，stop-all.sh 会尝试清理
4. **权限**：确保脚本有执行权限（`chmod +x scripts/*.sh`）

## 故障排除

### 脚本无法执行

```bash
chmod +x scripts/start-all.sh scripts/stop-all.sh
```

### 服务无法停止

```bash
# 手动停止
./scripts/stop-all.sh

# 如果还有问题，手动清理端口
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### 查看日志

```bash
# 查看前端日志
tail -f scripts/pids/frontend.log

# 查看后端日志
tail -f scripts/pids/backend.log
```


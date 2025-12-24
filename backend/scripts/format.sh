#!/bin/bash
# 代码格式化脚本

set -e

echo "=== 格式化代码 (black) ==="
black app tests

echo ""
echo "=== 排序导入 (isort) ==="
isort app tests

echo ""
echo "✅ 代码格式化完成！"


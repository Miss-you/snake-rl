#!/bin/bash
# Lint和静态检查脚本

set -e

echo "=== 运行代码格式化检查 (black) ==="
black --check --diff app tests

echo ""
echo "=== 运行导入排序检查 (isort) ==="
isort --check-only --diff app tests

echo ""
echo "=== 运行代码风格检查 (flake8) ==="
flake8 app tests

echo ""
echo "=== 运行代码质量检查 (pylint) ==="
pylint app --exit-zero

echo ""
echo "=== 运行类型检查 (mypy) ==="
mypy app --ignore-missing-imports || true

echo ""
echo "✅ 所有检查完成！"


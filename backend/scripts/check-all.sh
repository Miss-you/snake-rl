#!/bin/bash
# 运行所有检查（lint + 测试）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "🔍 运行代码质量检查..."
bash scripts/lint.sh

echo ""
echo "🧪 运行单元测试..."
bash scripts/test.sh

echo ""
echo "✅ 所有检查通过！"


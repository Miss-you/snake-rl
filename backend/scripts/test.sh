#!/bin/bash
# 测试运行脚本

set -e

echo "=== 运行单元测试 ==="
pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

echo ""
echo "✅ 测试完成！"
echo "📊 覆盖率报告已生成：htmlcov/index.html"


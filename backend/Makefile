.PHONY: help install test lint format check-all clean

help:
	@echo "可用的命令:"
	@echo "  make install     - 安装依赖"
	@echo "  make test        - 运行测试"
	@echo "  make lint        - 运行代码质量检查"
	@echo "  make format      - 格式化代码"
	@echo "  make check-all   - 运行所有检查（lint + test）"
	@echo "  make clean       - 清理临时文件"

install:
	pip install -r requirements.txt

test:
	pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

lint:
	bash scripts/lint.sh

format:
	bash scripts/format.sh

check-all:
	bash scripts/check-all.sh

clean:
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -r {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -r {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -r {} + 2>/dev/null || true
	find . -type d -name ".coverage" -exec rm -r {} + 2>/dev/null || true
	rm -f .coverage coverage.xml


#!/bin/bash

# 矿山可视化监管平台启动脚本
# Mine Visualization Monitoring Platform Launcher

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 切换到应用目录
cd "$SCRIPT_DIR"

echo "============================================================"
echo "🏔️  矿山生态修复智能监测与碳汇评估平台"
echo "    Mine Ecological Restoration Monitoring Platform"
echo "============================================================"
echo ""

# 检查Python是否可用
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3"
    echo "请安装Python3后重试"
    read -p "按回车键退出..."
    exit 1
fi

echo "🚀 正在启动矿山可视化监管平台..."
echo "📁 工作目录: $SCRIPT_DIR"
echo ""

# 启动Python应用
python3 app_launcher.py

echo ""
echo "👋 感谢使用矿山可视化监管平台！"
read -p "按回车键退出..."
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
矿山可视化监管平台启动器
Mine Visualization Monitoring Platform Launcher
"""

import os
import sys
import time
import threading
import webbrowser
import http.server
import socketserver
from pathlib import Path

class MineVisualizationApp:
    def __init__(self):
        self.port = 8000
        self.host = 'localhost'
        self.server = None
        self.app_dir = Path(__file__).parent
        
    def find_available_port(self):
        """查找可用端口"""
        import socket
        for port in range(8000, 8100):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('localhost', port))
                    self.port = port
                    return port
            except OSError:
                continue
        return 8000
    
    def start_server(self):
        """启动HTTP服务器"""
        try:
            # 切换到应用目录
            os.chdir(self.app_dir)
            
            # 查找可用端口
            self.find_available_port()
            
            # 创建HTTP服务器
            handler = http.server.SimpleHTTPRequestHandler
            
            # 添加MIME类型支持
            handler.extensions_map.update({
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.svg': 'image/svg+xml',
                '.json': 'application/json'
            })
            
            self.server = socketserver.TCPServer(("", self.port), handler)
            
            print(f"🚀 矿山可视化监管平台启动中...")
            print(f"📍 服务器地址: http://{self.host}:{self.port}")
            print(f"📁 工作目录: {self.app_dir}")
            print(f"🌐 正在启动浏览器...")
            
            # 在新线程中启动服务器
            server_thread = threading.Thread(target=self.server.serve_forever)
            server_thread.daemon = True
            server_thread.start()
            
            # 等待服务器启动
            time.sleep(2)
            
            # 打开浏览器
            url = f"http://{self.host}:{self.port}"
            webbrowser.open(url)
            
            print(f"✅ 应用已启动！")
            print(f"💡 在浏览器中访问: {url}")
            print(f"❌ 按 Ctrl+C 退出应用")
            
            # 保持主线程运行
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                self.stop_server()
                
        except Exception as e:
            print(f"❌ 启动失败: {e}")
            input("按回车键退出...")
            sys.exit(1)
    
    def stop_server(self):
        """停止服务器"""
        if self.server:
            print(f"\n🛑 正在关闭服务器...")
            self.server.shutdown()
            self.server.server_close()
            print(f"✅ 服务器已关闭")

def main():
    """主函数"""
    print("=" * 60)
    print("🏔️  矿山生态修复智能监测与碳汇评估平台")
    print("    Mine Ecological Restoration Monitoring Platform")
    print("=" * 60)
    
    app = MineVisualizationApp()
    app.start_server()

if __name__ == "__main__":
    main()
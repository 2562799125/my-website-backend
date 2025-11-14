#!/bin/bash

# 阿里云服务器部署脚本
# 这个脚本用于在阿里云服务器上部署Flask应用

echo "开始部署Flask应用到阿里云服务器..."

# 更新系统包
echo "更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装Python3和pip
echo "安装Python3和pip..."
sudo apt install -y python3 python3-pip python3-venv nginx

# 创建应用目录
echo "创建应用目录..."
sudo mkdir -p /var/www/myapp
sudo chown -R $USER:$USER /var/www/myapp

# 复制项目文件到服务器
echo "请手动将项目文件复制到 /var/www/myapp 目录"
echo "使用命令: scp -r backend/* user@your-server-ip:/var/www/myapp/"

# 创建Python虚拟环境
echo "创建Python虚拟环境..."
cd /var/www/myapp
python3 -m venv venv
source venv/bin/activate

# 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 创建systemd服务文件
echo "创建systemd服务文件..."
sudo tee /etc/systemd/system/myapp.service > /dev/null <<EOF
[Unit]
Description=My Flask App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
Environment="PATH=/var/www/myapp/venv/bin"
Environment="FLASK_ENV=production"
Environment="SECRET_KEY=your-secret-key-here"
ExecStart=/var/www/myapp/venv/bin/gunicorn --workers 3 --bind unix:myapp.sock -m 007 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 创建WSGI入口文件
echo "创建WSGI入口文件..."
cat > wsgi.py <<EOF
import os
from app import app as application

if __name__ == "__main__":
    application.run()
EOF

# 配置Nginx
echo "配置Nginx..."
sudo tee /etc/nginx/sites-available/myapp > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器IP

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/myapp/myapp.sock;
    }

    location /uploads {
        alias /var/www/myapp/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 16M;
}
EOF

# 启用站点
echo "启用Nginx站点..."
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# 启动应用服务
echo "启动应用服务..."
sudo systemctl daemon-reload
sudo systemctl start myapp
sudo systemctl enable myapp

# 创建上传目录并设置权限
echo "创建上传目录..."
mkdir -p /var/www/myapp/uploads
sudo chown -R www-data:www-data /var/www/myapp/uploads

# 配置防火墙（如果使用UFW）
echo "配置防火墙..."
sudo ufw allow 'Nginx Full'

echo "部署完成！"
echo "应用应该可以通过你的服务器IP或域名访问"
echo "检查服务状态: sudo systemctl status myapp"
echo "查看日志: sudo journalctl -u myapp -f"
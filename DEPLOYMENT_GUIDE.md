# 阿里云服务器部署指南

## 前提条件

1. 阿里云服务器（ECS实例）
2. 服务器已安装Ubuntu 20.04/22.04 LTS
3. 服务器已开放80端口（HTTP）
4. 域名（可选，但推荐）

## 步骤一：服务器初始化

### 1. 连接服务器
```bash
ssh root@你的服务器IP
```

### 2. 创建新用户（推荐）
```bash
adduser yourusername
usermod -aG sudo yourusername
```

### 3. 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

## 步骤二：安装必要软件

### 1. 安装Python和Nginx
```bash
sudo apt install -y python3 python3-pip python3-venv nginx
```

### 2. 安装其他工具
```bash
sudo apt install -y git curl vim
```

## 步骤三：部署应用

### 1. 创建应用目录
```bash
sudo mkdir -p /var/www/myapp
sudo chown -R $USER:$USER /var/www/myapp
cd /var/www/myapp
```

### 2. 上传项目文件
从本地计算机上传文件到服务器：
```bash
# 在本地计算机上执行
scp -r /Users/elysiafucaros/Desktop/程序设计与应用/web/backend/* yourusername@你的服务器IP:/var/www/myapp/
```

或者使用Git：
```bash
cd /var/www/myapp
git clone your-repository-url .
```

### 3. 创建虚拟环境
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. 安装依赖
```bash
pip install -r requirements.txt
```

## 步骤四：配置Systemd服务

### 1. 创建服务文件
```bash
sudo nano /etc/systemd/system/myapp.service
```

### 2. 添加以下内容：
```ini
[Unit]
Description=My Flask App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
Environment="PATH=/var/www/myapp/venv/bin"
Environment="FLASK_ENV=production"
Environment="SECRET_KEY=your-secret-key-here-change-this"
ExecStart=/var/www/myapp/venv/bin/gunicorn --workers 3 --bind unix:myapp.sock -m 007 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. 启动服务
```bash
sudo systemctl daemon-reload
sudo systemctl start myapp
sudo systemctl enable myapp
```

### 4. 检查服务状态
```bash
sudo systemctl status myapp
```

## 步骤五：配置Nginx

### 1. 创建Nginx配置
```bash
sudo nano /etc/nginx/sites-available/myapp
```

### 2. 添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器IP

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/myapp/myapp.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/myapp/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 16M;
}
```

### 3. 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 步骤六：设置上传目录权限

```bash
sudo mkdir -p /var/www/myapp/uploads
sudo chown -R www-data:www-data /var/www/myapp/uploads
sudo chmod -R 755 /var/www/myapp/uploads
```

## 步骤七：配置防火墙

如果使用UFW：
```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 步骤八：测试部署

1. 检查应用是否运行：
```bash
curl http://localhost/api/articles
```

2. 检查Nginx配置：
```bash
sudo nginx -t
```

3. 查看应用日志：
```bash
sudo journalctl -u myapp -f
```

## 常见问题解决

### 1. 权限问题
```bash
sudo chown -R www-data:www-data /var/www/myapp
sudo chmod -R 755 /var/www/myapp
```

### 2. 重启服务
```bash
sudo systemctl restart myapp
sudo systemctl restart nginx
```

### 3. 查看错误日志
```bash
# 应用日志
sudo journalctl -u myapp -n 50

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. 测试Gunicorn
```bash
cd /var/www/myapp
source venv/bin/activate
/var/www/myapp/venv/bin/gunicorn --workers 3 --bind unix:myapp.sock -m 007 wsgi:app
```

## 安全建议

1. **更改默认密钥**：修改`SECRET_KEY`环境变量
2. **使用HTTPS**：配置SSL证书（Let's Encrypt）
3. **定期更新**：保持系统和依赖包更新
4. **备份**：定期备份上传的文件和数据库

## 后续优化

1. 配置HTTPS（SSL证书）
2. 设置数据库（PostgreSQL/MySQL）
3. 配置CDN加速静态文件
4. 设置监控和日志分析
5. 配置自动备份

## 一键部署脚本

你也可以使用我创建的部署脚本：
```bash
# 上传deploy.sh到服务器
chmod +x deploy.sh
./deploy.sh
```

注意：脚本需要根据实际情况修改配置参数。

## 数据库持久化（SQLite，默认）

- 默认数据库位置：`/var/www/myapp/data.sqlite`（可通过环境变量 `DATABASE_URL` 修改）
- 备份建议：
  - 手动备份：`sudo cp /var/www/myapp/data.sqlite /var/backups/myapp-$(date +%F).sqlite`
  - 定期备份：使用 `cron` 或备份脚本每日复制数据库文件
- 迁移到 PostgreSQL：
  - 安装并创建数据库与用户
  - 设置环境变量：`Environment="DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/myapp"`
  - `sudo systemctl daemon-reload && sudo systemctl restart myapp`

## 多后端共存避免冲突（推荐方案）

通过 Nginx 路由前缀将不同后端隔离，同时每个后端使用独立的 `systemd` 服务与 Unix Socket。

1. 现有后端（本项目）统一挂载在 `/api` 前缀：
```nginx
location /api {
    include proxy_params;
    proxy_pass http://unix:/var/www/myapp/myapp.sock;
}
```

2. 新后端示例（例如另一套接口），挂载在 `/service2` 前缀：
```nginx
location /service2 {
    include proxy_params;
    proxy_pass http://unix:/var/www/otherapp/otherapp.sock;
}
```

3. 对应 `systemd` 服务独立：
```ini
[Service]
WorkingDirectory=/var/www/otherapp
ExecStart=/var/www/otherapp/venv/bin/gunicorn --workers 2 --bind unix:otherapp.sock -m 007 wsgi:app
```

这样不同后端的监听“插口”（Unix Socket 或端口）不会冲突，路由前缀也避免路径重叠。

4. 如需独立域名或子域名（例如 `api.example.com` 与 `api2.example.com`），可为每个后端配置独立 `server {}` 块，进一步隔离流量与证书配置。
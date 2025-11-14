import os
from datetime import timedelta

class Config:
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 上传配置
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # 安全配置
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'webm'}
    
    # 数据库配置：默认使用项目目录下 SQLite 文件，可通过环境变量覆盖
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///data.sqlite'
    
    # CORS配置：默认仅允许你的前端域名（可通过环境变量覆盖）
    DEFAULT_CORS = 'https://sicau.hongqiaozhumeng.asia'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', DEFAULT_CORS).split(',')
    
    # 服务器配置
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

class ProductionConfig(Config):
    DEBUG = False
    # 生产环境使用环境变量
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev-secret-key'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}
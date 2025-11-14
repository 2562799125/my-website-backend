import os
import json
from flask import Flask, request, jsonify, send_from_directory
import secrets
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker, scoped_session
from config import config
from models import Base, Article, User

def create_app(config_name='production'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 配置CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # 确保上传目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app

# 创建应用实例
app = create_app(os.environ.get('FLASK_ENV', 'production'))

# 获取配置
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']
ALLOWED_IMAGE_EXTENSIONS = app.config['ALLOWED_IMAGE_EXTENSIONS']
ALLOWED_VIDEO_EXTENSIONS = app.config['ALLOWED_VIDEO_EXTENSIONS']

# 数据库初始化
engine = create_engine(app.config['DATABASE_URL'], future=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False))
Base.metadata.create_all(bind=engine)

def get_db():
    return SessionLocal()

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

@app.route('/api/articles', methods=['GET'])
def get_articles():
    # 支持分页：/api/articles?page=1&page_size=20，返回数组以兼容现有前端
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 20))
        if page < 1 or page_size < 1 or page_size > 100:
            raise ValueError
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid pagination params'}), 400
    db = get_db()
    try:
        q = db.query(Article).order_by(desc(Article.created_at))
        total = q.count()
        items = q.offset((page - 1) * page_size).limit(page_size).all()
        result = []
        for a in items:
            images = json.loads(a.images) if a.images else []
            videos = json.loads(a.videos) if a.videos else []
            result.append({
                'title': a.title,
                'content': a.content,
                'section': a.section,
                'images': images,
                'videos': videos
            })
        resp = jsonify(result)
        resp.headers['X-Total-Count'] = str(total)
        resp.headers['X-Page'] = str(page)
        resp.headers['X-Page-Size'] = str(page_size)
        return resp
    finally:
        db.close()

@app.route('/api/articles', methods=['POST'])
def add_article():
    data = request.json or {}
    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    section = (data.get('section') or '').strip()
    images = data.get('images', [])
    videos = data.get('videos', [])

    if not title or not content or not section:
        return jsonify({'success': False, 'message': 'title, content, section are required'}), 400
    if not isinstance(images, list) or not isinstance(videos, list):
        return jsonify({'success': False, 'message': 'images and videos must be arrays'}), 400
    db = get_db()
    try:
        a = Article(
            title=title,
            content=content,
            section=section,
            images=json.dumps(images, ensure_ascii=False),
            videos=json.dumps(videos, ensure_ascii=False)
        )
        db.add(a)
        db.commit()
        article = {
            'title': a.title,
            'content': a.content,
            'section': a.section,
            'images': images,
            'videos': videos
        }
        return jsonify({'success': True, 'article': article}), 201
    finally:
        db.close()

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    if allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        file_url = f'/uploads/{filename}'  # 返回相对路径，避免混合内容
        return jsonify({'success': True, 'url': file_url})
    else:
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ====== 简易用户系统：登录 / 用户信息 / 头像上传 ======

def _get_token_from_auth_header():
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return None

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password required'}), 400
    db = get_db()
    try:
        user = db.query(User).filter_by(username=username).first()
        if user is None:
            user = User(
                username=username,
                password_hash=generate_password_hash(password),
                nickname=username,
                avatar_url=''
            )
            db.add(user)
        else:
            if not check_password_hash(user.password_hash, password):
                return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        token = secrets.token_hex(16)
        user.token = token
        db.commit()
        return jsonify({'success': True, 'token': token, 'username': user.username, 'nickname': user.nickname or user.username, 'avatarUrl': user.avatar_url or ''})
    finally:
        db.close()

@app.route('/api/userinfo', methods=['GET'])
def userinfo():
    token = _get_token_from_auth_header()
    if not token:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    db = get_db()
    try:
        user = db.query(User).filter_by(token=token).first()
        if user is None:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        return jsonify({'success': True, 'username': user.username, 'nickname': user.nickname or user.username, 'avatarUrl': user.avatar_url or ''})
    finally:
        db.close()

@app.route('/api/upload-avatar', methods=['POST'])
def upload_avatar():
    token = _get_token_from_auth_header()
    if not token:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    db = get_db()
    try:
        user = db.query(User).filter_by(token=token).first()
        if user is None:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        if 'avatar' not in request.files:
            return jsonify({'success': False, 'message': 'No avatar part'}), 400
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400

    # 仅允许图片
        if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'success': False, 'message': 'Avatar file type not allowed'}), 400

        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        file_url = f'/uploads/{filename}'
        user.avatar_url = file_url
        db.commit()
        return jsonify({'success': True, 'avatarUrl': file_url})
    finally:
        db.close()

if __name__ == '__main__':
    # 开发环境运行
    if os.environ.get('FLASK_ENV') == 'development':
        app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
    else:
        # 生产环境应该使用gunicorn运行
        print("生产环境请使用: gunicorn --workers 3 --bind 0.0.0.0:5000 wsgi:app")

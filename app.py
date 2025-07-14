import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# 配置上传文件夹
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'webm'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 简单内存存储（建议上线用数据库）
articles = []

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

@app.route('/api/articles', methods=['GET'])
def get_articles():
    return jsonify(articles[::-1])

@app.route('/api/articles', methods=['POST'])
def add_article():
    data = request.json
    article = {
        'title': data.get('title'),
        'content': data.get('content'),
        'section': data.get('section'),
        'images': data.get('images', []),  # 前端传图片URL数组
        'videos': data.get('videos', [])   # 前端传视频URL数组
    }
    articles.append(article)
    return jsonify({'success': True, 'article': article})

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
        file_url = f'/uploads/{filename}'
        return jsonify({'success': True, 'url': file_url})
    else:
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)

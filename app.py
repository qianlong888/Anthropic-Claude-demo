#!/usr/bin/env python3
"""
示例Web应用 - 包含一些常见的编程问题供BugBot检测
"""

import os
import sqlite3
from flask import Flask, request, render_template_string

app = Flask(__name__)

# 潜在问题1: 硬编码的敏感信息
SECRET_KEY = "super_secret_key_123"
DATABASE_PASSWORD = "admin123"

# 潜在问题2: SQL注入漏洞
def get_user_data(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # 危险：直接拼接SQL查询
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    result = cursor.fetchall()
    conn.close()
    return result

# 潜在问题3: 未验证的用户输入
@app.route('/user/<user_id>')
def show_user(user_id):
    # 没有输入验证
    user_data = get_user_data(user_id)
    return f"User data: {user_data}"

# 潜在问题4: XSS漏洞
@app.route('/search')
def search():
    query = request.args.get('q', '')
    # 直接渲染用户输入，可能导致XSS
    template = f"""
    <html>
        <body>
            <h1>搜索结果</h1>
            <p>你搜索了: {query}</p>
        </body>
    </html>
    """
    return render_template_string(template)

# 潜在问题5: 资源泄露
def process_file(filename):
    try:
        file = open(filename, 'r')
        content = file.read()
        # 忘记关闭文件
        return content.upper()
    except:
        # 空的异常处理
        pass

# 潜在问题6: 无限循环的可能性
def calculate_factorial(n):
    result = 1
    while n > 0:
        result *= n
        # 忘记递减n，可能导致无限循环
        # n -= 1  # 这行被注释了
    return result

# 潜在问题7: 类型错误
def divide_numbers(a, b):
    # 没有检查除零错误
    return a / b

# 潜在问题8: 不安全的随机数生成
import random
def generate_token():
    # 使用不安全的伪随机数生成器
    return str(random.randint(100000, 999999))

# 潜在问题9: 内存效率问题
def process_large_list():
    # 创建不必要的大列表
    numbers = list(range(1000000))
    squared = []
    for num in numbers:
        squared.append(num * num)
    return squared

if __name__ == '__main__':
    # 潜在问题10: 在生产环境中使用debug模式
    app.run(debug=True, host='0.0.0.0') 
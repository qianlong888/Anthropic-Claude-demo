/**
 * 前端JavaScript示例 - 包含常见问题供BugBot检测
 */

// 潜在问题1: 全局变量污染
var userData = {};
var currentUser = null;
var isLoggedIn = false;

// 潜在问题2: 不安全的eval使用
function executeUserCode(userInput) {
    // 危险：直接执行用户输入
    return eval(userInput);
}

// 潜在问题3: DOM XSS漏洞
function displayMessage(message) {
    // 直接插入HTML，可能导致XSS
    document.getElementById('output').innerHTML = message;
}

// 潜在问题4: 缺少错误处理
function fetchUserData(userId) {
    fetch(`/api/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            // 没有错误处理
            userData = data;
            displayUserInfo(data);
        });
}

// 潜在问题5: 内存泄露 - 未清理事件监听器
function setupEventListeners() {
    const button = document.getElementById('submit-btn');
    button.addEventListener('click', function() {
        console.log('Button clicked');
    });
    // 没有提供清理方法
}

// 潜在问题6: 竞态条件
let requestCount = 0;
function sendRequest() {
    requestCount++;
    
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            // 可能出现竞态条件
            if (requestCount === 1) {
                processData(data);
            }
        });
}

// 潜在问题7: 不安全的随机数
function generateSessionId() {
    // Math.random()不够安全用于生成会话ID
    return Math.random().toString(36).substr(2, 9);
}

// 潜在问题8: 原型污染风险
function mergeObjects(target, source) {
    for (let key in source) {
        // 没有检查__proto__等危险属性
        target[key] = source[key];
    }
    return target;
}

// 潜在问题9: 同步XMLHttpRequest（已废弃）
function getUserDataSync(userId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/users/${userId}`, false); // 同步请求
    xhr.send();
    return JSON.parse(xhr.responseText);
}

// 潜在问题10: 无限递归的可能性
function countdown(n) {
    console.log(n);
    if (n > 0) {
        // 错误：应该是n-1
        countdown(n);
    }
}

// 潜在问题11: 类型强制转换问题
function compareValues(a, b) {
    // 使用==而不是===，可能导致类型强制转换问题
    if (a == b) {
        return "equal";
    }
    return "not equal";
}

// 潜在问题12: 未验证的localStorage使用
function saveUserPreferences(prefs) {
    // 没有验证数据就直接存储
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
}

// 潜在问题13: 缺少CSRF保护的表单提交
function submitForm(formData) {
    fetch('/api/update-profile', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
        // 缺少CSRF token
    });
}

// 潜在问题14: 性能问题 - 在循环中查询DOM
function updateList(items) {
    const container = document.getElementById('list-container');
    for (let i = 0; i < items.length; i++) {
        // 每次循环都查询DOM
        const listItem = document.createElement('li');
        listItem.textContent = items[i];
        document.getElementById('list-container').appendChild(listItem);
    }
} 
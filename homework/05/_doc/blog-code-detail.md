# gogogo 社群平台 - 技術解說報告

## 一、專案介紹

### 1.1 專案背景
本專案是一個類似 Threads.com 的社群平台，使用 Node.js + Express + SQLite + EJS 模板引擎建構。系統提供用戶註冊、發文、按讚、留言、關注等社群基本功能。

### 1.2 技術棧
| 技術 | 版本 | 用途 |
|------|------|------|
| Node.js | - | 執行環境 |
| Express | 4.18.x | Web 框架 |
| sql.js | 1.10.x | SQLite JavaScript 實現 |
| express-session | 1.17.x | 會話管理 |
| EJS | 3.1.x | 模板引擎 |

### 1.3 專案結構
```
blog/
├── server.js          # 主程式碼，Express 路由
├── database.js        # 資料庫操作模組
├── package.json       # 專案設定
├── blog.db           # SQLite 資料庫檔案
├── node_modules/     # 依賴套件
├── public/           # 靜態資源
└── views/            # EJS 模板
    ├── index.ejs      # 首頁
    ├── profile.ejs    # 個人頁面
    ├── post.ejs       # 文章詳情
    ├── explore.ejs    # 探索頁面
    ├── login.ejs      # 登入
    ├── register.ejs    # 註冊
    ├── new.ejs        # 發文
    └── edit.ejs       # 編輯文章
```

---

## 二、系統架構

### 2.1 請求流程
```
瀏覽器請求 → Express 路由 → 中間件處理 → 資料庫操作 → EJS 渲染 → 回應 HTML
```

### 2.2 會話管理流程
```
請求 → express-session 中間件 → 檢查 session.userId → 通過或重定向
```

---

## 三、資料庫設計

### 3.1 資料表結構

#### users（用戶表）
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### posts（貼文表）
```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### follows（關注表）
```sql
CREATE TABLE follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);
```

#### likes（按讚表）
```sql
CREATE TABLE likes (
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
```

#### comments（留言表）
```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.2 ER 關係圖
```
users ──┬── posts (一對多)
        │
        ├── follows ── users (多對多自我關聯)
        │
        ├── likes ── posts (多對多)
        │
        └── comments ── posts (一對多)
```

---

## 四、程式碼解說

### 4.1 server.js 主要結構

#### 4.1.1 中間件設定
```javascript
app.use(express.urlencoded({ extended: true }));  // 解析 POST 資料
app.use(session({                                // 會話管理
    secret: 'gogogo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }  // 7 天有效期
}));
```

#### 4.1.2 認證中間件
```javascript
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}
```
保護需要登入的路由（發文、編輯、刪除、按讚、留言等）

#### 4.1.3 取得當前用戶
```javascript
function getCurrentUser(req) {
    if (!req.session.userId) return null;
    const user = db.getUserById(req.session.userId);
    // 附加統計資料
    user.followers = db.getFollowers(user.id).length;
    user.following = db.getFollowing(user.id).length;
    user.posts = db.getUserPosts(user.id).length;
    return user;
}
```

#### 4.1.4 貼文元資料處理
```javascript
function addPostMeta(posts, userId) {
    return posts.map(post => ({
        ...post,
        likes: db.getLikesCount(post.id),
        commentsCount: db.getCommentsCount(post.id),
        isLiked: userId ? db.isLiked(userId, post.id) : false
    }));
}
```
為每篇貼文附加按讚數、留言數、當前用戶是否已按讚

### 4.2 database.js 函式說明

#### 4.2.1 sql.js 使用方式
```javascript
// 執行 SQL（無參數）
db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);

// 參數化查詢
const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
stmt.bind([username]);
if (stmt.step()) {
    user = stmt.getAsObject();
}
stmt.free();

// 取得最後插入的 ID
const result = db.exec("SELECT last_insert_rowid() as id");
```

#### 4.2.2 關注功能實作
```javascript
function follow(followerId, followingId) {
    try {
        db.run("INSERT OR IGNORE INTO follows ...", [...]);
        saveDatabase();  // 寫入磁碟
        return true;
    } catch { return false; }
}
```

---

## 五、路由設計

### 5.1 路由清單

| 路由 | 方法 | 認證 | 說明 |
|------|------|------|------|
| `/` | GET | 否 | 首頁（For you / Following / My Posts） |
| `/explore` | GET | 否 | 探索頁面 |
| `/profile/:id` | GET | 否 | 個人頁面 |
| `/post/:id` | GET | 否 | 文章詳情 |
| `/new` | GET | 是 | 發文頁面 |
| `/create` | POST | 是 | 發布文章 |
| `/edit/:id` | GET | 是 | 編輯頁面 |
| `/update` | POST | 是 | 更新文章 |
| `/delete` | POST | 是 | 刪除文章 |
| `/follow` | POST | 是 | 關注用戶 |
| `/unfollow` | POST | 是 | 取消關注 |
| `/like` | POST | 是 | 按讚 |
| `/unlike` | POST | 是 | 取消按讚 |
| `/comment` | POST | 是 | 留言 |
| `/login` | GET/POST | 否 | 登入 |
| `/register` | GET/POST | 否 | 註冊 |
| `/logout` | GET | 否 | 登出 |

### 5.2 路由保護範例
```javascript
// 刪除文章需要本人才能刪除
app.post('/delete', requireAuth, (req, res) => {
    if (req.body.id) {
        db.deletePost(parseInt(req.body.id), req.session.userId);
    }
    res.redirect('/');
});
```

---

## 六、前端模板說明

### 6.1 首頁架構（index.ejs）
```html
<div class="app">
    <aside class="sidebar">        <!-- 左側導航 -->
        <nav>Home / Explore / Profile</nav>
    </aside>
    
    <main class="main">          <!-- 中央內容 -->
        <div class="create-post">   <!-- 發文框（需登入） -->
        <div class="tabs">         <!-- For you / Following / My Posts -->
        <div class="feed">         <!-- 貼文列表 -->
    </main>
    
    <aside class="right-sidebar">  <!-- 右側推薦 -->
</div>
```

### 6.2 Tab 切換 JavaScript
```javascript
function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.feed').forEach(f => f.style.display = 'none');
    event.target.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
}
```

### 6.3 按讚表單
```html
<!-- 未按讚 -->
<form action="/like" method="POST">
    <input type="hidden" name="post_id" value="<%= post.id %>">
    <button type="submit">🤍 <%= post.likes %></button>
</form>

<!-- 已按讚 -->
<form action="/unlike" method="POST">
    <input type="hidden" name="post_id" value="<%= post.id %>">
    <button type="submit" class="liked">❤️ <%= post.likes %></button>
</form>
```

---

## 七、樣式設計

### 7.1 主題色彩
```css
/* 深色主題 */
body {
    background: #000;      /* 黑色背景 */
    color: #fff;          /* 白色文字 */
}

/* 漸層頭像 */
.avatar {
    background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
}
```

### 7.2 響應式設計
```css
@media (max-width: 900px) {
    .right-sidebar { display: none; }  /* 隱藏右側 */
    .sidebar { width: 80px; }          /* 縮小側邊欄 */
}
```

---

## 八、安全性考量

### 8.1 目前已實作
- ✅ 會話管理（express-session）
- ✅ 路由保護（requireAuth 中間件）
- ✅ SQL 參數化查詢（防止注入）
- ✅ 密碼驗證（明文比對，需改進）

### 8.2 待改進項目
- ⬜ 密碼雜湊（建議使用 bcrypt）
- ⬜ CSRF 保護
- ⬜ 輸入驗證和過濾
- ⬜ 速率限制（防止暴力破解）

---

## 九、部署說明

### 9.1 本地端執行
```bash
cd /Users/tim/Desktop/tim/_wp/homework/05/blog
npm install          # 安裝依賴
node server.js       # 啟動伺服器
```

### 9.2 環境需求
- Node.js 14+
- 記憶體 512MB+
- 硬碟空間 100MB+

### 9.3 預設測試帳號
| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| alice | alice123 |
| bob | bob123 |

---

## 十、延伸功能建議

1. **即時通知**：WebSocket 實現新按讚、留言通知
2. **搜尋功能**：全文搜尋用戶和貼文
3. **圖片上傳**：整合 AWS S3 或本地儲存
4. **個人頭像**：自訂上傳頭像
5. **私訊功能**：用戶間私人訊息
6. **分享功能**：分享貼文到其他平台
7. **收藏功能**：收藏喜歡的貼文

---

## 十一、疑難排解

### Q1: 資料庫寫入失敗
檢查 `blog.db` 檔案權限，確保有寫入權限。

### Q2: Session 無效
清除瀏覽器 Cookie，使用無痕模式測試。

### Q3: 模板渲染錯誤
檢查 EJS 語法，確保變數都有傳遞。

---

*文件完成時間：2026-03-27*
*作者：AI Assistant*

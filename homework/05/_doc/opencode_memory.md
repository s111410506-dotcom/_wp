# OpenCode Memory - gogogo 社群平台專案

## 專案基本資訊

**專案名稱**：gogogo
**專案類型**：社群平台（類似 Threads.com）
**專案位置**：/Users/tim/Desktop/tim/_wp/homework/05/blog
**專案根目錄**：/Users/tim/Desktop/tim/_wp/homework/05/

## 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| Node.js | 24.14.0 | 執行環境 |
| Express | 4.18.x | Web 框架 |
| sql.js | 1.10.x | SQLite JavaScript 實現（純 JS，無需編譯） |
| express-session | 1.17.x | 會話管理 |
| EJS | 3.1.x | 模板引擎 |

**重要**：本專案使用 sql.js 而非 better-sqlite3，因為 better-sqlite3 需要 C++ 編譯，在 Node.js 24.x 環境會有編譯錯誤。

## 啟動方式

```bash
cd /Users/tim/Desktop/tim/_wp/homework/05/blog
npm install    # 第一次執行需要
npm start     # 或 node server.js
```

服務運行於 http://localhost:3000

## 測試帳號

| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| alice | alice123 |
| bob | bob123 |

## 主要功能清單

### 1. 用戶系統
- 用戶註冊（/register）- 檢查使用者名稱是否已存在
- 用戶登入（/login）- 使用 session 驗證
- 用戶登出（/logout）- 銷毀 session 並回到首頁
- 個人資料頁（/profile/:id）- 顯示用戶資訊、發文、followers/following 統計

### 2. 貼文功能
- 發布貼文（/create）- 可選擇公開或私人
- 編輯貼文（/edit/:id, /update）- 僅限本人
- 刪除貼文（/delete）- 僅限本人，使用 POST 提交
- 隱私設定（is_public 欄位）- 公開貼文所有人可見，私人貼文僅本人可見

### 3. 社群互動
- 愛心按讚（/like）- POST 請求，需登入
- 取消按讚（/unlike）- POST 請求，需登入
- 留言回覆（/comment）- POST 請求，需登入
- 關注用戶（/follow）- POST 請求，需登入
- 取消關注（/unfollow）- POST 請求，需登入

### 4. 頁面功能
- 首頁（/）- 三個 Tab：For you（公開貼文）/ Following（關注者貼文）/ My Posts（個人貼文）
- 探索頁面（/explore）- 瀏覽所有用戶和公開貼文
- 文章詳情頁（/post/:id）- 顯示按讚數、留言數、留言列表

## 資料庫結構

**資料庫位置**：/Users/tim/Desktop/tim/_wp/homework/05/blog/blog.db
**資料庫類型**：SQLite（使用 sql.js）

### users（用戶表）
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

### posts（貼文表）
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

### follows（關注表）
```sql
CREATE TABLE follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
);
```

### likes（按讚表）
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

### comments（留言表）
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

## 檔案架構

```
/Users/tim/Desktop/tim/_wp/homework/05/blog/
├── server.js          # Express 伺服器主檔案
├── database.js        # 資料庫操作模組
├── package.json       # npm 專案設定
├── blog.db           # SQLite 資料庫檔案（自動產生）
├── node_modules/     # npm 依賴套件
├── public/           # 靜態資源目錄（空目錄）
└── views/            # EJS 模板目錄
    ├── index.ejs      # 首頁（主時間軸）
    ├── profile.ejs    # 個人頁面
    ├── post.ejs       # 文章詳情頁
    ├── explore.ejs    # 探索頁面
    ├── login.ejs      # 登入頁面
    ├── register.ejs   # 註冊頁面
    ├── new.ejs        # 發布新貼文頁面
    └── edit.ejs       # 編輯貼文頁面
```

## server.js 重要程式碼說明

### 中間件設定
```javascript
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'threads-clone-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }  // 7 天
}));
```

### 認證中間件
```javascript
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}
```

### 取得當前用戶（含統計）
```javascript
function getCurrentUser(req) {
    if (!req.session.userId) return null;
    const user = db.getUserById(req.session.userId);
    user.followers = db.getFollowers(user.id).length;
    user.following = db.getFollowing(user.id).length;
    user.posts = db.getUserPosts(user.id).length;
    return user;
}
```

### 為貼文添加元資料
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

## database.js 重要函式

### sql.js 使用方式
```javascript
// 參數化查詢
const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
stmt.bind([username]);
if (stmt.step()) {
    user = stmt.getAsObject();
}
stmt.free();

// 執行 SQL
db.run("INSERT INTO posts (content, user_id, is_public) VALUES (?, ?, ?)", [content, userId, isPublic ? 1 : 0]);

// 取得插入的 ID
const result = db.exec("SELECT last_insert_rowid() as id");
```

## 路由清單

| 路由 | 方法 | 認證 | 說明 |
|------|------|------|------|
| / | GET | 否 | 首頁（For you / Following / My Posts） |
| /explore | GET | 否 | 探索頁面 |
| /profile/:id | GET | 否 | 個人頁面 |
| /post/:id | GET | 否 | 文章詳情 |
| /new | GET | 是 | 發文頁面 |
| /create | POST | 是 | 發布文章 |
| /edit/:id | GET | 是 | 編輯頁面 |
| /update | POST | 是 | 更新文章 |
| /delete | POST | 是 | 刪除文章 |
| /follow | POST | 是 | 關注用戶 |
| /unfollow | POST | 是 | 取消關注 |
| /like | POST | 是 | 按讚 |
| /unlike | POST | 是 | 取消按讚 |
| /comment | POST | 是 | 留言 |
| /login | GET/POST | 否 | 登入 |
| /register | GET/POST | 否 | 註冊 |
| /logout | GET | 否 | 登出 |

## 前端 UI 設計

### 主題色彩
```css
/* 深色主題 */
body { background: #000; color: #fff; }

/* 漸層頭像 */
.avatar {
    background: linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045);
}
```

### 按讚按鈕
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

## 開發歷程

1. **第一階段**：建立基礎網誌系統
   - 使用 Node.js + Express + SQLite (sql.js) + EJS
   - 實現文章 CRUD 功能

2. **第二階段**：加入用戶認證功能
   - 實現 register/login/logout
   - 使用 express-session 管理會話
   - 加入 requireAuth 中間件保護路由

3. **第三階段**：修復問題
   - 修復登出後錯誤（redirect 從 /login 改為 /）
   - 修復註冊失敗問題（db.exec 改為 db.prepare）

4. **第四階段**：Threads 風格改造
   - 深色主題設計
   - 三欄式佈局
   - 三個 Tab（For you / Following / My Posts）
   - 新增關注功能
   - 新增探索頁面

5. **第五階段**：愛心按讚和留言功能
   - 新增 likes、comments 資料表
   - 實作 /like、/unlike、/comment 路由
   - 按讚和留言數即時更新

6. **第六階段**：文件整理
   - 建立 .gitignore
   - 建立專案文件

## Git 忽略設定

已建立 /Users/tim/Desktop/tim/_wp/homework/.gitignore

```
node_modules/
*.db
.env
.env.local
*.log
.DS_Store
.idea/
.vscode/
dist/
build/
```

## 重要提醒

1. **sql.js vs better-sqlite3**：本專案使用 sql.js 是因為 better-sqlite3 在 Node.js 24.x 環境無法編譯
2. **資料庫寫入**：sql.js 需要手動呼叫 saveDatabase() 才能將記憶體資料寫入磁碟
3. **Session 管理**：使用 express-session，cookie 名稱預設為 connect.sid
4. **密碼儲存**：目前密碼是明文儲存，生產環境應使用 bcrypt 雜湊

## 延伸功能建議

1. 密碼雜湊（bcrypt）
2. CSRF 保護
3. WebSocket 即時通知
4. 圖片上傳功能
5. 搜尋功能
6. 個人頭像上傳
7. 私訊功能

## 文件位置

```
/Users/tim/Desktop/tim/_wp/homework/05/_doc/
├── 專案摘要.md         # 專案功能摘要
├── 對話紀錄.md        # 完整開發對話紀錄
├── 技術解說報告.md    # 詳細技術文件
└── opencode_memory.md  # 本檔案（AI 記憶）
```

## 版本資訊

- 建立日期：2026-03-27
- Node.js 版本：24.14.0
- 最後更新：新增按讚和留言功能

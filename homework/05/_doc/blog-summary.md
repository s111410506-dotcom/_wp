# gogogo 社群平台 - 專案摘要

## 專案概述
使用 Node.js + Express + SQLite (sql.js) + EJS 模板引擎建構的社群平台，風格類似 Threads.com。

## 專案位置
`/Users/tim/Desktop/tim/_wp/homework/05/blog`

## 功能清單

### 1. 用戶系統
- 用戶註冊 (`/register`)
- 用戶登入 (`/login`)
- 用戶登出 (`/logout`)
- 個人資料頁面 (`/profile/:id`)

### 2. 貼文功能
- 發布公開/私人貼文
- 編輯自己的貼文
- 刪除自己的貼文
- 隱私設定（公開/私人）

### 3. 社群互動
- 愛心按讚/取消按讚
- 留言回覆功能
- 關注/取消關注其他用戶
- 粉絲數/關注數統計

### 4. 頁面功能
- **首頁** (`/`)：For you / Following / My Posts 三個 Tab
- **探索頁面** (`/explore`)：瀏覽所有用戶和公開貼文
- **文章詳情頁** (`/post/:id`)：顯示按讚數、留言數、留言列表

## 技術架構

### 資料庫結構 (SQLite)
- `users` - 用戶資料表
- `posts` - 貼文資料表
- `follows` - 關注關係表
- `likes` - 按讚資料表
- `comments` - 留言資料表

### 主要檔案
- `server.js` - Express 伺服器，包含所有路由
- `database.js` - 資料庫操作模組
- `views/` - EJS 模板檔案
  - `index.ejs` - 首頁
  - `profile.ejs` - 個人頁面
  - `post.ejs` - 文章詳情
  - `explore.ejs` - 探索頁面
  - `login.ejs` - 登入頁面
  - `register.ejs` - 註冊頁面
  - `new.ejs` / `edit.ejs` - 發文/編輯頁面

## 預設測試帳號
| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| alice | alice123 |
| bob | bob123 |

## 啟動方式
```bash
cd /Users/tim/Desktop/tim/_wp/homework/05/blog
npm start
```

然後访问 http://localhost:3000

## 設計特色
- 深色主題（黑色背景）
- 漸層頭像
- 響應式設計
- 即時更新按讚/留言狀態

## Git 忽略設定
已建立 `.gitignore`，過濾：
- `node_modules/`
- `*.db` (SQLite 資料庫)
- `.env` (環境變數)
- `.DS_Store` (系統檔)
- `*.log` (日誌檔)

---

*最後更新：2026-03-27*

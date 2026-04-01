# gogogo 專案開發對話紀錄

## 日期：2026-03-27

---

## 第一階段：建立基礎網誌系統

**使用者**：請用 node.js + sqlite 寫一個簡易的網誌系統，放在 blog/ 下

**開發**：建立完整網誌系統
- 建立目錄結構、安裝依賴
- 發現 better-sqlite3 編譯問題，改用 sql.js
- 建立 database.js、server.js 及 EJS 模板

**功能**：首頁列表、檢視/新增/編輯/刪除文章、SQLite 持久化

---

## 第二階段：加入用戶認證功能

**使用者**：請加上 1.創建新用戶 2.登入，登出，註冊等功能

**開發**：
- 資料庫新增 users 資料表
- 建立 express-session 會話管理
- 新增 register/login/logout 路由
- 新增 login.ejs、register.ejs 模板
- 加入 requireAuth 中間件

**預設帳號**：admin / admin123

---

## 第三階段：修復登出問題

**使用者**：登出後會顯示錯誤無法使用

**修復**：修改 /logout 路由，登出後 redirect 到 '/' 而非 '/login'

---

## 第四階段：修復註冊失敗問題

**使用者**：無法註冊新用戶，出現 "Registration failed" 錯誤

**修復**：
- db.exec() 不支援參數化查詢
- 改用 db.prepare() + stmt.bind() 進行查詢
- 簡化 createUser 函式邏輯

---

## 第五階段：移動專案目錄

**使用者**：下次更改時可以直接在 05/blog 裡更改嗎

**處理**：將 blog 目錄移動到 /Users/tim/Desktop/tim/_wp/homework/05/blog

---

## 第六階段：重新設計成 Threads 風格

**使用者**：修改成像 threads.com 那樣的風格，包含美術排版，要有個人貼文區，和公共的貼文區

**開發**：

### 資料庫重構
- users 資料表：新增 bio、avatar 欄位
- posts 資料表：移除 title，新增 is_public 欄位
- 新增 follows 資料表：追蹤用戶關係
- 新增函式：getAllPublicPosts、getUserPosts、getFollowingPosts、follow、unfollow 等

### 路由重構
- 重構首頁：三個 Tab (For you / Following / My Posts)
- 新增 /explore 探索頁面路由
- 新增 /profile/:id 個人頁面路由
- 新增 /follow、/unfollow 路由

### 模板重構
- index.ejs：三欄式佈局（導航 + 內容 + 推薦用戶）
- profile.ejs：個人頁面（頭貼、bio、統計、Follow 按鈕）
- explore.ejs：探索頁面（用戶卡片 + 公開貼文）
- login.ejs、register.ejs：Threads 風格深色主題

### 設計特色
- 深色主題（黑色背景 #000）
- 漸層頭像
- 三欄式響應式佈局

### 預設資料
- 用戶：admin、alice、bob
- 密碼：各自 username + "123"

---

## 第七階段：品牌名稱修改

**使用者**：將 Threads 改成 gogogo

**處理**：使用 sed 批次取代所有模板中的 "Threads" → "gogogo"

---

## 第八階段：愛心按讚和留言功能

**使用者**：按愛心跟留言功能無法使用

**問題**：這些功能尚未實作

**開發**：

### 資料庫更新
- 新增 likes 資料表：儲存按讚記錄
- 新增 comments 資料表：儲存留言
- 新增函式：likePost、unlikePost、isLiked、getLikesCount、getComments、addComment、getCommentsCount

### 路由更新
- 新增 /like、/unlike、/comment POST 路由
- 新增 addPostMeta() 函式為所有貼文添加 meta 資訊

### 模板更新
- index.ejs、profile.ejs、explore.ejs：加入愛心按鈕
- post.ejs：愛心按鈕 + 留言列表 + 留言輸入框

### UI 設計
- 未按讚：🤍 + 數字
- 已按讚：❤️（紅色）+ 數字
- 表單提交支援 POST 請求

---

## 第九階段：Git 忽略設定

**使用者**：請在我專案根目錄 /Users/tim/Desktop/tim/_wp/homework 檔案加上 node.js 需要過濾的那些條件進去

**處理**：建立 .gitignore，過濾 node_modules/、*.db、.env、*.log、.DS_Store、.idea/、.vscode/ 等

---

## 第十階段：建立專案文件

**使用者**：請把這次我們對話的摘要寫在這個資料夾下 /Users/tim/Desktop/tim/_wp/homework/05/_doc

**使用者**：請在同一個資料夾裡再生成一個記錄我們全部對話的檔案

**使用者**：請修正成你的回答部分只要摘要就好我的對話要全部保留

**處理**：
- 建立 /Users/tim/Desktop/tim/_wp/homework/05/_doc 目錄
- 建立「專案摘要.md」- 功能清單和技術架構說明
- 建立「對話紀錄.md」- 完整開發過程記錄（本檔案）

---

## 最終專案狀態

### 目錄結構
```
/Users/tim/Desktop/tim/_wp/homework/05/
├── _doc/
│   ├── 專案摘要.md
│   └── 對話紀錄.md
└── blog/
    ├── server.js
    ├── database.js
    ├── package.json
    ├── blog.db
    ├── node_modules/
    ├── public/
    └── views/
        ├── index.ejs
        ├── profile.ejs
        ├── post.ejs
        ├── explore.ejs
        ├── login.ejs
        ├── register.ejs
        ├── new.ejs
        └── edit.ejs
```

### 啟動方式
```bash
cd /Users/tim/Desktop/tim/_wp/homework/05/blog
npm start
```
訪問 http://localhost:3000

### 測試帳號
| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| alice | alice123 |
| bob | bob123 |

---

*紀錄完成時間：2026-03-27*

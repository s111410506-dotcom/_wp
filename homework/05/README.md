# 作業 05 — Node.js 部落格系統（迭代開發）

使用 Node.js + Express + SQLite + EJS 逐步建構社群平台 **gogogo**。

## 專案結構

```
05/
├── blog1/          # 第一版：基本 CRUD（無登入）
├── blog2/          # 新增用戶認證（express-session）
├── blog3/          # 重構：抽離 getCurrentUser helper
├── blog4/          # 修正註冊 bug
├── blog5/          # 社群功能：關注、個人頁、探索、公開/私人貼文
├── blog6/          # 品牌更名 gogogo
├── blog/           # 最新工作目錄（完整版含按讚、留言）
└── _doc/           # 開發紀錄與技術文件
```

## 各版本功能演進

| 版本 | 新增功能 |
|------|---------|
| blog1 | 貼文 CRUD（無認證） |
| blog2 | 註冊/登入/登出、session |
| blog3 | 重構、程式碼精簡 |
| blog4 | bug 修正 |
| blog5 | 追蹤、個人頁、公開/私人、探索頁、7天 session |
| blog6 | 品牌更名 |

## 技術棧

- **Express** — 路由與 middleware
- **sql.js** — 瀏覽器端 SQLite
- **express-session** — session 認證
- **EJS** — 伺服器渲染模板

## 啟動方式

```bash
cd blog
npm install
npm start
# http://localhost:3000
```

## 測試帳號

| 帳號 | 密碼 |
|------|------|
| admin | admin123 |
| alice | alice123 |
| bob | bob123 |

## 作答方式

閱讀各版本原始碼，理解逐步迭代的過程。可啟動任一版本觀察行為差異。

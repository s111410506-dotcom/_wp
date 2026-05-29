# WP 課程作業總覽

國立金門大學 資訊工程學系 — Web Programming 課程

---

## 各週作業

### 02 — HTML 問卷表單 `✅ 完成`

一份「未來科技與生活調查表」靜態 HTML 表單，展示了 HTML5 各類輸入元件（文字、密碼、email、電話、URL、數字、單選、複選、範圍、日期、時間、週、顏色、檔案、文字區域、隱藏欄位），採用簡潔的卡片式佈局與藍色調設計。

- 技術：HTML5、CSS
- 路徑：`02/Questionnaire/`

### 03 — 個人主頁 `✅ 完成`

使用 Tailwind CSS 建置的個人品牌頁面，介紹學生陳鈺婷（國立金門大學資工系）。包含個人頭像與簡介、技能欄位（程式語言、網頁開發、其他技術）以響應式三欄網格呈現，以及 Email/GitHub/LinkedIn 聯絡區塊與導覽列。

- 技術：Tailwind CSS、Font Awesome
- 路徑：`03/`

### 04 — JavaScript 10 練習 `✅ 完成`

十題 JavaScript 入門練習，涵蓋迴圈、條件式、陣列、物件、函式等基礎：

1. 奇偶數判斷
2. FizzBuzz
3. 乘法表
4. 陣列加總與平均
5. 成人過濾
6. 水果庫存購買系統
7. JSON 序列化/反序列化
8. 找最長單字
9. 分數篩選（及格線 60）
10. 數字反轉

- 技術：Node.js
- 路徑：`04/`

### 05 — 社群平台部落格 `✅ 完成`

以 Express + EJS + SQLite 打造、具有 7 個迭代版本的 Threads 風格社群平台。功能包括：使用者註冊/登入/登出、貼文 CRUD、公開/私人權限、追蹤/取消追蹤、按讚（愛心）、留言、個人檔案統計、「為你推薦 / 正在追蹤 / 我的貼文」三欄時間軸。暗色主題，響應式佈局。

- 預設測試帳號：`admin` / `alice` / `bob`（密碼同使用者名稱 + `123`）
- 技術：Express、EJS、SQLite、express-session
- 路徑：`05/blog/`

### 06 — JS 概念筆記 `🟡 部分完成`

十個 JavaScript 主題檔案，僅第 8 題有實際內容，說明了 JavaScript 中「傳參考 vs. 傳值」的行為差異。其餘檔案為空白佔位。

- 技術：JavaScript
- 路徑：`06/`

### 07 — JS 進階練習 `🟡 部分完成`

另一組十題 JavaScript 進階練習，僅第 8 題（三元運算子）與第 10 題（error-first callback）有內容，其餘為空白。

- 技術：JavaScript、Node.js
- 路徑：`07/`

### 08 — Rust Hello World `⬜ 未開始`

一個空白的 Rust 原始碼檔案（`hello.rs`），尚未撰寫任何內容。

- 技術：Rust
- 路徑：`08/`

---

## 期中專題

### 期中 — 貪吃蛇遊戲 `✅ 完成`

經典 Snake 遊戲 + 排行榜系統，前端使用 Canvas 繪圖、支援鍵盤 (WASD/方向鍵)、觸碰滑動與 D-pad 控制。後端分別以四種技術實作相同的 API：

- **Node.js (Express)** — 簡潔輕量，檔案儲存
- **Python (FastAPI)** — 非同步高效
- **Rust (Axum)** — 高效能，記憶體儲存
- **Next.js** — React 全端框架，Vercel KV 儲存

深色霓虹主題，響應式手機支援。LAN 部署與 Vercel 部署。

- 技術：Canvas、Express、FastAPI、Axum (Rust)、Next.js
- 路徑：`midterm/game/`
- 線上版：https://next-app-sable-six.vercel.app

---

## 期末專題

### 期末 — 作業說明網站 `🔄 進行中`

此網站彙整 homework 目錄下所有專案的說明文件，以視覺化卡片介面呈現各作業的內容、技術棧與狀態，方便瀏覽與導覽。

- 技術：HTML、CSS
- 路徑：`期末/`
- 線上版：https://wp-ochre-theta.vercel.app/homework/期末/

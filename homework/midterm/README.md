# Snake Game — 期中作業

一個經典貪吃蛇遊戲，搭配排行榜功能，使用四種不同的後端技術實作。

## 功能

- **貪吃蛇遊戲** — Canvas 繪製，鍵盤 WASD / 方向鍵 + 螢幕方向按鈕控制
- **先輸入名稱再開始** — 遊戲開始前輸入玩家名稱，結束後自動上傳分數
- **排行榜** — 顯示 Top 10 或全部人的分數，支援 Show All / Top 10 切換
- **四種後端實作** — Node.js、FastAPI、Rust、Next.js，共用同一份前端

## 系統架構

```
┌──────────────────────────────────────────────────┐
│                  Browser (Frontend)               │
│         game/index.html + style.css + script.js   │
│                   Canvas Snake Game               │
└──────────────┬───────────────────────────────────┘
               │  fetch('/api/leaderboard')
               ▼
┌──────────────────────────────────────────────────┐
│            Leaderboard API (Backend)              │
│  GET  /api/leaderboard  → 回傳排行榜（可選全部）    │
│  POST /api/leaderboard  → 上傳分數 {name, score}  │
└──────────────────────────────────────────────────┘
```

四種後端都實作同一組 REST API，並 serve 同一份前端靜態檔案。

## 四種後端實作

### 1. Next.js（port 3000）
- 框架：Next.js 14 (Pages Router)
- 前端：React 元件（與共用前端分開，內建於頁面中）
- 後端：API Routes（`pages/api/leaderboard.js`）
- 儲存：Vercel KV (Redis) / 檔案備援
- 部署：Vercel (https://next-app-sable-six.vercel.app)

### 2. Node.js + Express（port 3001）
- 框架：Express
- 靜態檔案：`express.static()` serve `game/` 目錄
- 儲存：`leaderboard.json`
- 啟動：`node server.js`

### 3. FastAPI + Python（port 3002）
- 框架：FastAPI
- 靜態檔案：`StaticFiles` mount `game/` 目錄
- 儲存：`leaderboard.json`
- 啟動：`python main.py` 或 `uvicorn main:app`

### 4. Rust + Axum（port 3003）
- 框架：Axum (Tokio)
- 靜態檔案：`tower-http::ServeDir` serve `game/` 目錄
- 儲存：記憶體（Mutex<Vec>）
- 啟動：`cargo run`

## 專案結構

```
midterm/
├── game/                        # 共用前端（貪吃蛇遊戲）
│   ├── index.html               #   遊戲頁面結構
│   ├── style.css                #   樣式（暗色主題 + 綠色調）
│   └── script.js                #   遊戲邏輯（Canvas、鍵盤、觸控、API）
│
├── node-server/                 # Node.js + Express 後端
│   ├── package.json
│   ├── server.js                #   Express 伺服器 + leaderboard API
│   └── leaderboard.json         #   排行榜資料（自動產生）
│
├── fastapi-server/              # Python FastAPI 後端
│   ├── main.py                  #   FastAPI 伺服器 + leaderboard API
│   ├── requirements.txt         #   依賴：fastapi, uvicorn
│   └── leaderboard.json         #   排行榜資料（自動產生）
│
├── rust-server/                 # Rust Axum 後端
│   ├── Cargo.toml               #   依賴：axum, tokio, serde, chrono
│   └── src/
│       └── main.rs              #   Axum 伺服器 + leaderboard API
│
├── next-app/                    # Next.js 全端應用
│   ├── package.json
│   ├── next.config.js
│   ├── vercel.json
│   ├── pages/
│   │   ├── index.js             #   遊戲頁面（React 元件）
│   │   └── api/
│   │       └── leaderboard.js   #   API Route（支援 KV / 檔案）
│   └── leaderboard.json         #   備援儲存（自動產生）
│
└── README.md
```

## 快速開始

```bash
# 安裝依賴
cd node-server && npm install && cd ..
pip install -r fastapi-server/requirements.txt
cd rust-server && cargo build && cd ..
cd next-app && npm install && cd ..

# 執行任一伺服器
cd node-server && npm start              # http://localhost:3001
cd fastapi-server && python main.py      # http://localhost:8000
cd rust-server && cargo run              # http://localhost:3003
cd next-app && npm run dev               # http://localhost:3000
```

## 遊玩說明

1. 開啟瀏覽器連到伺服器網址
2. 輸入玩家名稱，按 **Start Game**
3. 用 **W A S D** 或 **方向鍵** 或 **螢幕按鈕** 控制蛇移動
4. 吃紅色食物增加長度與分數
5. 撞牆或撞到自己遊戲結束，分數自動上傳排行榜
6. 點 **Show All** 查看全部人的分數

## 部署

### Vercel（建議）

Next.js 版已部署於：
**https://next-app-sable-six.vercel.app**

若要自行部署：

```bash
cd next-app
npx vercel --prod --yes
```

### 區域網路

啟動任一伺服器後，同一區網的裝置可用電腦的 IP 連線：

```
http://<你的IP>:<PORT>
```

## Leaderboard API

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | `/api/leaderboard` | 回傳排行榜（預設 Top 20） |
| GET | `/api/leaderboard?all=true` | 回傳全部分數 |
| POST | `/api/leaderboard` | 上傳分數 `{ "name": "...", "score": N }` |

### API 範例

```bash
# 取得排行榜
curl http://localhost:3001/api/leaderboard

# 取得全部
curl "http://localhost:3001/api/leaderboard?all=true"

# 上傳分數
curl -X POST http://localhost:3001/api/leaderboard \
  -H 'Content-Type: application/json' \
  -d '{"name":"Player1","score":100}'
```

## 技術亮點

- **共用前端** — 同一份 HTML/CSS/JS 由四種不同後端伺服
- **統一的 REST API** — 所有後端實作相同的 `/api/leaderboard` 端點
- **Canvas 遊戲** — 純前端 Canvas 渲染，無遊戲引擎依賴
- **觸控支援** — 手機 swipe 與方向按鈕皆可遊玩
- **自動上傳** — 遊戲結束自動提交分數，無需手動操作
- **Vercel KV** — 支援 Redis 持久化儲存（自動備援到檔案）

# 作業 02 — HTML 表單與輸入類型

使用 HTML5 表單元素，實作一份「未來科技與生活調查」問卷。

## 說明

`Questionnaire` 是一份已經寫好的 HTML 表單，搭配 Node.js + Express 伺服器可實際填寫提交。

## 啟用問卷

```bash
npm install   # 安裝依賴（首次）
npm start     # 啟動伺服器
```

開啟瀏覽器連到 **http://localhost:3000** 即可填寫問卷並提交。

## 表單輸入類型

| 類型 | 範例 |
|------|------|
| `text` | 姓名 |
| `email` | 電子郵件 |
| `password` | 密碼 |
| `tel` | 電話 |
| `url` | 個人部落格 |
| `number` | 幸運數字 |
| `radio` | 性別 |
| `checkbox` | 興趣主題 |
| `range` | 樂觀程度 |
| `date` | 日期 |
| `time` | 時間 |
| `week` | 週數 |
| `color` | 配色 |
| `file` | 檔案上傳 |
| `textarea` | 多行文字 |
| `hidden` | 隱藏欄位 |
| `reset` / `submit` | 按鈕 |

## 作答方式

1. 啟動伺服器後開啟 http://localhost:3000
2. 填寫問卷內容
3. 點擊「傳送問卷」提交，檢視結果頁面

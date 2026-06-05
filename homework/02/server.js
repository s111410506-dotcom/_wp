const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Questionnaire'));
});

app.post('/submit', (req, res) => {
  const data = req.body;
  let html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>問卷結果</title><style>
    body { font-family: sans-serif; background: #f4f7f6; padding: 20px; }
    .container { max-width: 700px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    h2 { color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    td:first-child { font-weight: bold; width: 120px; color: #555; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-decoration: none; }
  </style></head><body>
  <div class="container"><h2>問卷已收到</h2><table>`;
  for (const [key, value] of Object.entries(data)) {
    html += `<tr><td>${key}</td><td>${Array.isArray(value) ? value.join(', ') : value}</td></tr>`;
  }
  html += `</table><a href="/" class="btn">回問卷首頁</a></div></body></html>`;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`問卷伺服器已啟動：http://localhost:${PORT}`);
});

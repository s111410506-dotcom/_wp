const req = { body: { title: "JS教學", content: "內容在此", author: "Gemini" } };

// 只要一行，直接從 req.body 提取同名常數
const { title, content } = req.body;

console.log(title, content); // 印出：JS教學 內容在此
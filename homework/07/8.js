const user = "Guest";

// 使用三元運算子 (Ternary Operator) 進行判斷
const welcomeMsg = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;

console.log(welcomeMsg); // 印出：<h1>Welcome, Guest</h1>
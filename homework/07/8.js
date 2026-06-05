const user = "Guest";

// 使用三元運算子： (條件) ? (如果 true) : (如果 false)
const html = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;

console.log(html); // 印出：<h1>Welcome, Guest</h1>
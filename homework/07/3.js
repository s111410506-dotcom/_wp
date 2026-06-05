const posts = [{id: 1, t: "A"}, {id: 2, t: "B"}];
let html = "";

posts.forEach(post => {
  // 使用反引號 (`) 嵌入變數
  html += `<div>${post.t}</div>`;
});

console.log(html); // 印出：<div>A</div><div>B</div>
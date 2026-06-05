const post = {
  id: 1,
  title: "Hello World",
  content: "Markdown content"
};

// 方式一：點符號 (Dot notation) - 最直覺、最常用
console.log(post.title);

// 方式二：中括號 (Bracket notation) - 當屬性名是變數時必用
console.log(post["title"]);
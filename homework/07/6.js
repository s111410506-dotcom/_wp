const jsonStr = '{"title": "Post 1", "tags": ["js", "node"]}';

// 將字串解析回 JavaScript 物件
const obj = JSON.parse(jsonStr);

// 陣列索引從 0 開始，所以第二個元素是 [1]
console.log(obj.tags[1]); // 印出：node
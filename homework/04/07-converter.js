const user = { name: "Gemini", age: 1 };
const jsonStr = JSON.stringify(user);
const parsed = JSON.parse(jsonStr);

console.log("JSON 字串類型:", typeof jsonStr);
console.log("解析後的姓名:", parsed.name);
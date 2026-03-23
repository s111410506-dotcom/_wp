## 習題 4

AI 問答 https://gemini.google.com/share/bd7d1cde03ae

## 測試結果
```sh

01
tim@chenyutingdeMacBook-Air 04 % node 01-isEven.js
測試 10: true
測試 7: false
測試 0: true

02
tim@chenyutingdeMacBook-Air 04 % node 02-FizzBuzz.js
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz

03
tim@chenyutingdeMacBook-Air 04 % node 03-multiplication.js
2 x 1 = 2
2 x 2 = 4
2 x 3 = 6

04
tim@chenyutingdeMacBook-Air 04 % node 04-calculate.js
總和: 150
平均: 30

05
tim@chenyutingdeMacBook-Air 04 % node 05-age.js
Alice 是成年人
Charlie 是成年人

06
tim@chenyutingdeMacBook-Air 04 % node 06-inventory.js
買 2 個蘋果: 成功，剩餘 3
再買 4 個蘋果: 庫存不足

07
tim@chenyutingdeMacBook-Air 04 % node 07-converter.js
JSON 字串類型: string
解析後的姓名: Gemini

08
tim@chenyutingdeMacBook-Air 04 % node 08-findLongestWord.js
最長單字是: JavaScript

09
tim@chenyutingdeMacBook-Air 04 % node 09-score.js
及格名單: [ '小華' ]

10
tim@chenyutingdeMacBook-Air 04 % node 10-everseNumber.js
87654 反轉後: 45678

```
## 摘要

好的，這裡為你整理這 10 個練習題的**完整測試程式碼**與**執行結果**。你可以直接將這些程式碼複製到瀏覽器的開發者工具（Console）中執行。

---

### 1. 奇偶數判斷器

```javascript
function isEven(num) {
  return num % 2 === 0;
}

console.log("測試 10:", isEven(10));
console.log("測試 7:", isEven(7));
console.log("測試 0:", isEven(0));

```

**測試結果：**

> 測試 10: true
> 測試 7: false
> 測試 0: true

---

### 2. 數字馬拉松 (FizzBuzz)

```javascript
let i = 1;
let results = [];
while (i <= 15) { // 測試前 15 個數字即可
  if (i % 3 === 0 && i % 5 === 0) results.push("FizzBuzz");
  else if (i % 3 === 0) results.push("Fizz");
  else if (i % 5 === 0) results.push("Buzz");
  else results.push(i);
  i++;
}
console.log(results.join(", "));

```

**測試結果：**

> 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz

---

### 3. 九九乘法表

```javascript
// 以 2 的乘法作為測試範例
for (let j = 1; j <= 3; j++) {
  console.log(`2 x ${j} = ${2 * j}`);
}

```

**測試結果：**

> 2 x 1 = 2
> 2 x 2 = 4
> 2 x 3 = 6

---

### 4. 陣列總和與平均

```javascript
const numbers = [10, 20, 30, 40, 50];
let total = 0;
for (let n of numbers) { total += n; }

console.log("總和:", total);
console.log("平均:", total / numbers.length);

```

**測試結果：**

> 總和: 150
> 平均: 30

---

### 5. 聯絡人清單

```javascript
const friends = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 20 }
];

friends.forEach(f => {
  if (f.age > 18) console.log(`${f.name} 是成年人`);
});

```

**測試結果：**

> Alice 是成年人
> Charlie 是成年人

---

### 6. 水果櫃檯

```javascript
const inventory = { apple: 5 };

function buy(fruit, amount) {
  if (inventory[fruit] >= amount) {
    inventory[fruit] -= amount;
    return `成功，剩餘 ${inventory[fruit]}`;
  }
  return "庫存不足";
}

console.log("買 2 個蘋果:", buy("apple", 2));
console.log("再買 4 個蘋果:", buy("apple", 4));

```

**測試結果：**

> 買 2 個蘋果: 成功，剩餘 3
> 再買 4 個蘋果: 庫存不足

---

### 7. JSON 轉換器

```javascript
const user = { name: "Gemini", age: 1 };
const jsonStr = JSON.stringify(user);
const parsed = JSON.parse(jsonStr);

console.log("JSON 字串類型:", typeof jsonStr);
console.log("解析後的姓名:", parsed.name);

```

**測試結果：**

> JSON 字串類型: string
> 解析後的姓名: Gemini

---

### 8. 最長單字搜尋

```javascript
function findLongestWord(sentence) {
  const words = sentence.split(" ");
  let longest = words[0];
  for (let w of words) {
    if (w.length > longest.length) longest = w;
  }
  return longest;
}

console.log("最長單字是:", findLongestWord("Learn JavaScript today"));

```

**測試結果：**

> 最長單字是: JavaScript

---

### 9. 成績篩選器

```javascript
const students = [
  { name: "小明", score: 55 },
  { name: "小華", score: 82 }
];

function getPassed(list) {
  return list.filter(s => s.score >= 60).map(s => s.name);
}

console.log("及格名單:", getPassed(students));

```

**測試結果：**

> 及格名單: ["小華"]

---

### 10. 數字反轉器

```javascript
function reverseNumber(num) {
  let result = 0;
  while (num > 0) {
    result = result * 10 + (num % 10);
    num = Math.floor(num / 10);
  }
  return result;
}

console.log("87654 反轉後:", reverseNumber(87654));

```

**測試結果：**

> 87654 反轉後: 45678

---


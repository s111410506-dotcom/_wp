const numbers = [10, 20, 30, 40, 50];
let total = 0;
for (let n of numbers) { total += n; }

console.log("總和:", total);
console.log("平均:", total / numbers.length);
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
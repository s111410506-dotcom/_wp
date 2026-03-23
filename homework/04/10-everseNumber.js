function reverseNumber(num) {
  let result = 0;
  while (num > 0) {
    result = result * 10 + (num % 10);
    num = Math.floor(num / 10);
  }
  return result;
}

console.log("87654 反轉後:", reverseNumber(87654));
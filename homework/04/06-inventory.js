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
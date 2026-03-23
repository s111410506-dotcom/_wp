const friends = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 20 }
];

friends.forEach(f => {
  if (f.age > 18) console.log(`${f.name} 是成年人`);
});
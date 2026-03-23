function findLongestWord(sentence) {
  const words = sentence.split(" ");
  let longest = words[0];
  for (let w of words) {
    if (w.length > longest.length) longest = w;
  }
  return longest;
}

console.log("最長單字是:", findLongestWord("Learn JavaScript today"));
function mergeAlternately(word1: string, word2: string): string {
  let newWord = "";
  for (var i = 0; i < word1.length; i++) {
    newWord += word1[i];
    if (word2[i]) {
      newWord += word2[i];
    }
  }
  console.log("i", i);
  console.log("word.length", word2.length);

  if (i < word1.length) {
    newWord += word1.slice(i);
  } else if (i < word2.length) {
    newWord += word2.slice(i);
  }
  return newWord;
}

const a = mergeAlternately("cf", "eee");
console.log("a", a);

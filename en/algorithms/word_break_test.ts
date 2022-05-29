/**
 * <https://leetcode.com/problems/word-break/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function wordBreak(s: string, wordDict: string[]): boolean {
  const dp: boolean[] = Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (const word of wordDict) {
      // check if word can match
      const wordStartPosition = i - word.length;
      if (wordStartPosition < 0) {
        continue;
      }
      const wordLen = word.length;

      const isMatchUntilLastPosition = dp[i - wordLen];

      if (!isMatchUntilLastPosition) {
        continue;
      }
      const actualSubstringUntilI = s.substring(wordStartPosition, i);

      if (actualSubstringUntilI === word && isMatchUntilLastPosition) {
        dp[i] = true;
      }
    }
  }
  return dp[s.length];
}

Deno.test("word break1", () => {
  assertEquals(wordBreak("leetcode", ["leet", "code"]), true);
});
Deno.test("word break2", () => {
  assertEquals(wordBreak("applepenapple", ["apple", "pen"]), true);
});
Deno.test("word break3", () => {
  assertEquals(
    wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]),
    false
  );
});

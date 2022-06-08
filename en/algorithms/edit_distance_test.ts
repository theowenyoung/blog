/**
 * Edit Distance
 * <https://leetcode.com/problems/edit-distance/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function minDistance(word1: string, word2: string): number {
  const word1Len = word1.length;
  const word2Len = word2.length;

  const dp: number[][] = Array.from(Array(word1Len + 1), () =>
    Array(word2Len + 1).fill(0)
  );

  for (let i = 0; i <= word1Len; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= word2Len; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= word1Len; i++) {
    for (let j = 1; j <= word2Len; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return dp[word1Len][word2Len];
}

Deno.test("Edit Distance", () => {
  //
  assertEquals(minDistance("horse", "ros"), 3);
});

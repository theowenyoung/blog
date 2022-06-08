/**
 * Longest Common Subsequence
 * <https://leetcode.com/problems/longest-common-subsequence/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function longestCommonSubsequence(text1: string, text2: string): number {
  const text1Len = text1.length;
  const text2Len = text2.length;
  const dp: number[][] = Array.from(Array(text1Len), () => Array(text2Len));
  for (let i = 0; i < text1Len; i++) {
    for (let j = 0; j < text2Len; j++) {
      const text1Char = text1[i];
      const text2Char = text2[j];
      dp[i][j] = Math.max(
        i - 1 >= 0 ? dp[i - 1][j] : 0,
        j - 1 >= 0 ? dp[i][j - 1] : 0
      );

      if (text1Char === text2Char) {
        dp[i][j] = i - 1 >= 0 && j - 1 >= 0 ? dp[i - 1][j - 1] + 1 : 1;
      }
    }
  }

  return dp[text1Len - 1][text2Len - 1];
}

Deno.test("Longest Common Subsequence 1", () => {
  assertEquals(longestCommonSubsequence("ace", "abcde"), 3);
});

Deno.test("Longest Common Subsequence 2", () => {
  assertEquals(longestCommonSubsequence("bsbininm", "jmjkbkjkv"), 1);
});

/**
 * Longest Palindromic Subsequence
 * <https://leetcode.com/problems/longest-palindromic-subsequence/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

// dp[i][j], boolean
// from bottom to top
// if s[i]===s[j], then dp[i][j]=dp[i+1][j-1]+2;
// if s[i]!==s[j], then dp[i][j] = max(dp[i+1][j],dp[i][j-1]), cause i,j include i+1->j, i,j also include i->j-1
// return dp[0][length-1]
function longestPalindromeSubseq(s: string): number {
  const strLength = s.length;
  const dp: number[][] = Array.from(Array(strLength), () =>
    Array(strLength).fill(0)
  );
  for (let i = strLength - 1; i >= 0; i--) {
    dp[i][i] = 1;

    for (let j = i + 1; j < strLength; j++) {
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[0][strLength - 1];
}

Deno.test("Longest Palindromic Subsequence 1", () => {
  assertEquals(longestPalindromeSubseq("bbbab"), 4);
});

Deno.test("Longest Palindromic Subsequence 2", () => {
  assertEquals(longestPalindromeSubseq("cbbd"), 2);
});
Deno.test("Longest Palindromic Subsequence 3", () => {
  assertEquals(longestPalindromeSubseq("abefba"), 5);
});

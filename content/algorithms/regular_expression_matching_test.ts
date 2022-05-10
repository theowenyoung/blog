/**
 * <https://leetcode.com/problems/regular-expression-matching/>
 * ref: <https://redquark.org/leetcode/0010-regular-expression-matching/>
 * TODO too hard
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

// function isMatch(s: string, p: string): boolean {
//   if (p.includes("*") || p.includes(".")) {
//     const regex = new RegExp(p);
//     return regex.test(s);
//   } else {
//     return p.includes(s);
//   }
// }

function isMatch(s: string, p: string): boolean {
  const rows = s.length;
  const columns = p.length;
  /// Base conditions
  if (rows == 0 && columns == 0) {
    return true;
  }
  if (columns == 0) {
    return false;
  }
  // DP array
  const dp = Array.from({ length: s.length + 1 }, () => [false]);
  // Empty string and empty pattern are a match
  dp[0][0] = true;
  // Deals with patterns with *
  for (let i = 1; i < columns + 1; i++) {
    if (p[i - 1] === "*") {
      dp[0][i] = dp[0][i - 2];
    } else {
      dp[0][i] = false;
    }
  }
  // For remaining characters
  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < columns + 1; j++) {
      if (p[j - 1] === "*") {
        if (p[j - 2] === s[i - 1] || p[j - 2] === ".") {
          dp[i][j] = dp[i][j - 2] || dp[i - 1][j];
        } else {
          dp[i][j] = dp[i][j - 2];
        }
      } else if (p[j - 1] === s[i - 1] || p[j - 1] === ".") {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = false;
      }
    }
  }
  return dp[rows][columns];
}

Deno.test("isMatch", () => {
  assertEquals(isMatch("aa", "a"), false);
});
Deno.test("isMatch 2", () => {
  assertEquals(isMatch("aa", "a*"), true);
});
Deno.test("isMatch 3", () => {
  assertEquals(isMatch("ab", ".*"), true);
});
Deno.test("isMatch 4", () => {
  //
  assertEquals(isMatch("aab", "c*a*b"), true);
});
Deno.test("isMatch 5", () => {
  assertEquals(isMatch("mississippi", "mis*is*p*."), false);
});

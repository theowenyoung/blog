/**
 * <https://leetcode.com/problems/longest-palindromic-substring/>
 * Explanation:
 * <https://leetcode.com/problems/longest-palindromic-substring/discuss/900639/Python-Solution-%3A-with-detailed-explanation-%3A-using-DP>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function longestPalindrome1(s: string): string {
  let longest = 0;
  let longestString = "";
  for (let i = 0; i < s.length; i++) {
    // odd: asa

    let left = i - 1;
    let right = i + 1;

    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    // recover
    left = left + 1;
    right = right - 1;
    const length = right - left + 1;

    if (length > longest) {
      longest = length;
      longestString = s.slice(left, right + 1);
    }

    // even: abba
    if (s.length > 1) {
      let evenLeft = i; // initialize to the next character
      let evenRight = i + 1;
      while (
        evenLeft >= 0 &&
        evenRight < s.length &&
        s[evenLeft] === s[evenRight]
      ) {
        evenLeft = evenLeft - 1;
        evenRight = evenRight + 1;
      }
      // recover
      evenLeft = evenLeft + 1;
      evenRight = evenRight - 1;
      const evenLength = evenRight - evenLeft + 1;
      if (evenLength > longest) {
        longest = evenLength;
        longestString = s.slice(evenLeft, evenRight + 1);
      }
    }
  }

  return longestString;
}

// dp 2d array, boolean, if it's palindrome, then it's true
// abcba 0,1,2,3,4
// i,j i:j, 1,3 -> bcb
// if 2,2 is true, then if str[1]===str[3], then  dp[1][3] is true, if str[0]===str[4], then dp[0][4] = true, so i: 2->1->0, j:2->3->4
// j always greater or equal i,
// when i===j, always true, one charactor is always true
//
function longestPalindrome2(s: string): string {
  const strLength = s.length;
  const dp: boolean[][] = Array.from(Array(strLength), () => Array(strLength));
  let maxStr = "";
  for (let i = strLength - 1; i >= 0; i--) {
    dp[i][i] = true;
    if (1 > maxStr.length) {
      maxStr = s.slice(i, i + 1);
    }
    for (let j = i + 1; j < strLength; j++) {
      const currentStrLength = j - i + 1;
      if (s[i] === s[j]) {
        if (j - i === 1 || dp[i + 1][j - 1] === true) {
          dp[i][j] = true;
        } else {
          dp[i][j] = false;
        }
      } else {
        dp[i][j] = false;
      }
      if (dp[i][j] && currentStrLength > maxStr.length) {
        maxStr = s.slice(i, j + 1);
      }
    }
  }

  return maxStr;
}
const solutions = [longestPalindrome1, longestPalindrome2];
Deno.test("longest palindrome test 1", () => {
  const s = "babad";
  const result = longestPalindrome1(s);
  const expected = "bab";
  assertEquals(result, expected);
});
for (const longestPalindrome of solutions) {
  Deno.test("longest palindrome test 1", () => {
    const s = "babad";
    const result = longestPalindrome2(s);
    const expected = "aba";
    assertEquals(result, expected);
  });
  Deno.test("longest palindrome test 2", () => {
    const s = "cbbd";
    const result = longestPalindrome(s);
    const expected = "bb";
    assertEquals(result, expected);
  });
  Deno.test("longest palindrome test 3", () => {
    const s = "a";
    const result = longestPalindrome(s);
    const expected = "a";
    assertEquals(result, expected);
  });
  Deno.test("longest palindrome test 4", () => {
    const s = "ccc";
    const result = longestPalindrome(s);
    const expected = "ccc";
    assertEquals(result, expected);
  });

  Deno.test("longest palindrome test 5", () => {
    const s = "aacabdkacaa";
    const result = longestPalindrome(s);
    const expected = "aca";
    assertEquals(result, expected);
  });
}

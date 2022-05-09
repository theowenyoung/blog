/**
 * <https://leetcode.com/problems/longest-palindromic-substring/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function longestPalindrome(s: string): string {
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

Deno.test("longest palindrome test 1", () => {
  const s = "babad";
  const result = longestPalindrome(s);
  const expected = "bab";
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

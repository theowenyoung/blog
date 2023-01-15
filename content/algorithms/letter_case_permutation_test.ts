/**
 * <https://leetcode.com/problems/letter-case-permutation/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function isLetter(c: string) {
  return c.toLowerCase() != c.toUpperCase();
}
function letterCasePermutation(s: string): string[] {
  const result: string[] = [];
  const backtrack = (index: number, currentString: string) => {
    if (currentString.length === s.length) {
      result.push(currentString);
      return;
    }
    if (index < s.length) {
      const currentChar = s[index];
      if (isLetter(currentChar)) {
        // yes
        backtrack(index + 1, currentString + currentChar.toLowerCase());
        backtrack(index + 1, currentString + currentChar.toUpperCase());
      } else {
        backtrack(index + 1, currentString + currentChar);
      }
    }
  };

  backtrack(0, "");
  return result;
}

Deno.test("0338. Counting Bits", () => {
  assertEquals(letterCasePermutation("a1b2"), ["a1b2", "a1B2", "A1b2", "A1B2"]);
});

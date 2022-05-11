/**
 * <https://leetcode.com/problems/reverse-string/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
/**
 Do not return anything, modify s in-place instead.
 */
function reverseString(s: string[]): void {
  let index;
  if (s.length % 2 === 0) {
    index = s.length / 2 - 1;
  } else {
    index = Math.floor(s.length / 2);
  }
  while (index >= 0) {
    const temp = s[index];
    s[index] = s[s.length - 1 - index];
    s[s.length - 1 - index] = temp;
    index--;
  }
}

Deno.test("Reverse String 1", () => {
  const s = ["h", "e", "l", "l", "o"];
  reverseString(s);
  assertEquals(s, ["o", "l", "l", "e", "h"]);
});

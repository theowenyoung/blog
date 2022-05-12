/**
 * <https://leetcode.com/problems/implement-strstr/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function strStr(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 0;
  }
  for (let i = 0; i < haystack.length; i++) {
    const currentChar = haystack[i];

    if (currentChar === needle[0]) {
      if (haystack.slice(i, i + needle.length) === needle) {
        return i;
      }
    }
  }
  return -1;
}

Deno.test("strStr", () => {
  assertEquals(strStr("hello", "ll"), 2);
  assertEquals(strStr("aaaaa", "bba"), -1);
  assertEquals(strStr("", ""), 0);
  assertEquals(strStr("", "a"), -1);
  assertEquals(strStr("a", ""), 0);
  assertEquals(strStr("a", "a"), 0);
  assertEquals(strStr("a", "b"), -1);
});

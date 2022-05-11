/**
 * <https://leetcode.com/problems/reverse-words-in-a-string-iii/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function reverseWords(s: string): string {
  return s
    .split(" ")
    .map((item) => reverseString(item.split("")))
    .map((item) => item.join(""))
    .join(" ");
}
function reverseString(s: string[]): string[] {
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
  return s;
}
Deno.test("Reverse Words in a String III 1", () => {
  const s = "Let's take LeetCode contest";
  assertEquals(reverseWords(s), "s'teL ekat edoCteeL tsetnoc");
});

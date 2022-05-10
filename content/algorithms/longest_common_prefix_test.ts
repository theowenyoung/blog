/**
 * <https://leetcode.com/problems/longest-common-prefix/>
 * @param strs
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) {
    return "";
  }
  const prefix: string[] = [];
  let charAt = 0;
  while (true) {
    let tempPrefix = "";
    for (let strIndex = 0; strIndex < strs.length; strIndex++) {
      if (strs[strIndex][charAt]) {
        if (tempPrefix === "") {
          tempPrefix = strs[strIndex][charAt];
        } else {
          if (tempPrefix !== strs[strIndex][charAt]) {
            return prefix.join("");
          }
        }
      } else {
        return prefix.join("");
      }
    }
    prefix.push(tempPrefix);
    charAt++;
  }
}

Deno.test("longestCommonPrefix", () => {
  assertEquals(longestCommonPrefix(["flower", "flow", "flight"]), "fl");
  assertEquals(longestCommonPrefix(["dog", "racecar", "car"]), "");
  assertEquals(longestCommonPrefix(["c", "c"]), "c");
  assertEquals(longestCommonPrefix(["aa", "a"]), "a");
  assertEquals(longestCommonPrefix([""]), "");
  assertEquals(longestCommonPrefix(["a"]), "a");
});

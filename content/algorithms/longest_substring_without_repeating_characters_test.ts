/**
 * <https://leetcode.com/problems/longest-substring-without-repeating-characters/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function lengthOfLongestSubstring1(s: string): number {
  const arr = s.split("");
  let longest = 0;
  const set: Set<string> = new Set();
  for (let i = 0; i < arr.length; i++) {
    set.add(arr[i]);
    let tryIndex = i + 1;
    while (arr[tryIndex] && !set.has(arr[tryIndex])) {
      set.add(arr[tryIndex]);
      tryIndex++;
    }
    if (set.size > longest) {
      longest = set.size;
    }
    set.clear();
  }

  return longest;
}

function lengthOfLongestSubstring2(s: string): number {
  const lastCharOccurHash: Record<string, number> = {};
  const dp: number[] = Array(s.length);
  let max = 0; // current max
  let currentStartIndex = 0; // current unique substring start index
  for (let i = 0; i < s.length; i++) {
    const currentChar = s[i];
    if (lastCharOccurHash[currentChar] >= currentStartIndex) {
      // if the duplicated char occured in current string, then it's duplicated, we need to change the currentStartIndex to the lastCharOccurIndex+1;
      // and the dp[i] = i-
      currentStartIndex = lastCharOccurHash[currentChar] + 1;
      dp[i] = i - currentStartIndex + 1;
    } else {
      // if it's not duplicated, then add 1
      dp[i] = (dp[i - 1] ?? 0) + 1;
    }
    // change the max value if needed.
    if (dp[i] > max) {
      max = dp[i];
    }
    // record the last char position.
    lastCharOccurHash[currentChar] = i;
  }

  return max;
}

const solutions = [lengthOfLongestSubstring1, lengthOfLongestSubstring2];

for (const lengthOfLongestSubstring of solutions) {
  Deno.test("length of longest substring test 1", () => {
    const s = "abcabcbb";
    const result = lengthOfLongestSubstring(s);
    const expected = 3;
    assertEquals(result, expected);
  });

  Deno.test("length of longest substring test 2", () => {
    const s = "bbbbb";
    const result = lengthOfLongestSubstring(s);
    const expected = 1;
    assertEquals(result, expected);
  });

  Deno.test("length of longest substring test 3", () => {
    const s = "pwwkew";
    const result = lengthOfLongestSubstring(s);
    const expected = 3;
    assertEquals(result, expected);
  });

  Deno.test("length of longest substring test 4", () => {
    const s = " ";
    const result = lengthOfLongestSubstring(s);
    const expected = 1;
    assertEquals(result, expected);
  });

  Deno.test("length of longest substring test 5", () => {
    const s = "dvdf";
    const result = lengthOfLongestSubstring(s);
    const expected = 3;
    assertEquals(result, expected);
  });
  Deno.test("length of longest substring test 6", () => {
    const s = "abba";
    const result = lengthOfLongestSubstring(s);
    const expected = 2;
    assertEquals(result, expected);
  });
}

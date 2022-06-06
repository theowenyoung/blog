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
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    const currentChar = s[i];
    if (lastCharOccurHash[currentChar] >= 0) {
      dp[i] = Math.min(
        i - lastCharOccurHash[currentChar],
        (dp[i - 1] ?? 0) + 1
      );
    } else {
      dp[i] = (dp[i - 1] ?? 0) + 1;
    }
    if (dp[i] > max) {
      max = dp[i];
    }
    lastCharOccurHash[currentChar] = i;
  }

  return max;
}

function lengthOfLongestSubstring3(s: string): number {
  let j = 0,
    max = 0;
  let set: Set<string> = new Set();
  while (j < s.length) {
    let currentChar = s[j];
    if (!set.has(currentChar)) {
      j++;
      set.add(currentChar);
      max = Math.max(max, set.size);
    } else {
      set.delete(currentChar);
    }
  }
  return max;
}
const solutions = [
  lengthOfLongestSubstring1,
  lengthOfLongestSubstring2,
  lengthOfLongestSubstring3,
];

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

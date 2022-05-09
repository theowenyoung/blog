import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function lengthOfLongestSubstring(s: string): number {
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

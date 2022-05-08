import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
import { lengthOfLongestSubstring } from "./longest_substring_without_repeating_characters.ts";

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

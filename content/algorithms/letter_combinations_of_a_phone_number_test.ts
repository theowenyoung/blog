/**
 * <https://leetcode.com/problems/letter-combinations-of-a-phone-number/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function letterCombinations(digits: string): string[] {
  const phoneMap: Record<string, string> = {
    "2": "abc",
    "3": "def",
    "4": "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz",
  };
  let result: string[] = [];
  for (let i = 0; i < digits.length; i++) {
    const arr = phoneMap[digits[i]].split("");
    if (result.length === 0) {
      result = arr;
      continue;
    }
    const temp: string[] = [];

    for (let k = 0; k < result.length; k++) {
      for (let j = 0; j < arr.length; j++) {
        temp.push(result[k] + arr[j]);
      }
    }
    result = temp;
  }
  return result;
}

Deno.test("letter combinations", () => {
  assertEquals(letterCombinations("23"), [
    "ad",
    "ae",
    "af",
    "bd",
    "be",
    "bf",
    "cd",
    "ce",
    "cf",
  ]);
  assertEquals(letterCombinations(""), []);
  assertEquals(letterCombinations("2"), ["a", "b", "c"]);
  assertEquals(letterCombinations("23"), [
    "ad",
    "ae",
    "af",
    "bd",
    "be",
    "bf",
    "cd",
    "ce",
    "cf",
  ]);
});

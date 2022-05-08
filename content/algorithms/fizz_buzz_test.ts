/**
 * <https://leetcode.com/problems/fizz-buzz/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function fizzBuzz(n: number): string[] {
  const result: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(i.toString());
    }
  }
  return result;
}

Deno.test("Fizz Buzz 1", () => {
  const n = 15;
  const expected = [
    "1",
    "2",
    "Fizz",
    "4",
    "Buzz",
    "Fizz",
    "7",
    "8",
    "Fizz",
    "Buzz",
    "11",
    "Fizz",
    "13",
    "14",
    "FizzBuzz",
  ];
  assertEquals(fizzBuzz(n), expected);
});

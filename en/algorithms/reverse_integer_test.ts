/**
 * <https://leetcode.com/problems/reverse-integer/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function reverse(x: number): number {
  const isNegative = x < 0;
  let value = x;
  if (isNegative) {
    value = -value;
  }

  let current = value;
  const finalArray = [];
  while (current > 0) {
    const digit = current % 10;
    finalArray.push(digit);
    current = Math.floor(current / 10);
  }

  // remove leading zeros
  while (finalArray[0] === 0) {
    finalArray.shift();
  }
  let finalValue = 0;
  for (const digit of finalArray) {
    finalValue = finalValue * 10 + digit;
  }
  if (isNegative) {
    finalValue = -finalValue;
  }
  if (finalValue > 2147483647 || finalValue < -2147483648) {
    return 0;
  }
  return finalValue;
}

Deno.test("Reverse 1", () => {
  const x = 123;
  assertEquals(reverse(x), 321);
});
Deno.test("Reverse 2", () => {
  const x = -123;
  assertEquals(reverse(x), -321);
});

Deno.test("Reverse 3", () => {
  const x = 1534236469;
  assertEquals(reverse(x), 0);
});

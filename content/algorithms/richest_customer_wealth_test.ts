/**
 * <https://leetcode.com/problems/richest-customer-wealth/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maximumWealth(accounts: number[][]): number {
  let max = 0;
  for (const account of accounts) {
    let sum = 0;
    for (const amount of account) {
      sum += amount;
    }
    if (sum > max) {
      max = sum;
    }
  }
  return max;
}

Deno.test("Maximum Wealth 1", () => {
  const accounts = [
    [1, 2, 3],
    [3, 2, 1],
  ];
  assertEquals(maximumWealth(accounts), 6);
});
Deno.test("Maximum Wealth 2", () => {
  const accounts = [
    [1, 5],
    [7, 3],
    [3, 5],
  ];
  assertEquals(maximumWealth(accounts), 10);
});

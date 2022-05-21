/**
 * <https://leetcode.com/problems/n-th-tribonacci-number/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function tribonacci(n: number): number {
  if (n === 0) {
    return 0;
  } else if (n === 1) {
    return 1;
  } else if (n === 2) {
    return 1;
  }
  // dp
  const dp: number[] = Array(n + 1).fill(0);
  dp[0] = 0;
  dp[1] = 1;
  dp[2] = 1;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
  }

  return dp[n];
}

Deno.test("tribonacci 1", () => {
  assertEquals(tribonacci(4), 4);
});
Deno.test("tribonacci 2", () => {
  assertEquals(tribonacci(25), 1389537);
});

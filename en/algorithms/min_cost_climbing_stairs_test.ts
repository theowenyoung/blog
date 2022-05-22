/**
 * <https://leetcode.com/problems/min-cost-climbing-stairs/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function minCostClimbingStairs(cost: number[]): number {
  cost.push(0);
  const dp: number[] = Array(cost.length).fill(0);
  dp[cost.length - 1] = 0;
  dp[cost.length - 2] = cost[cost.length - 2];
  for (let i = cost.length - 3; i >= 0; i--) {
    dp[i] = Math.min(cost[i] + dp[i + 2], cost[i] + dp[i + 1]);
  }

  return Math.min(dp[0], dp[1]);
}

Deno.test("minCostClimbingStairs", () => {
  assertEquals(minCostClimbingStairs([10, 15, 20]), 15);
});

Deno.test("minCostClimbingStairs", () => {
  assertEquals(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]), 6);
});

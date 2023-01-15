/**
 * <https://leetcode.com/problems/climbing-stairs/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function climbStairs1(n: number): number {
  const dp = (
    currentStep: number,
    memo: Record<string, number> = {}
  ): number => {
    // console.log("memo", memo);
    // console.log("currentStep", currentStep);

    if (memo[currentStep] !== undefined) {
      return memo[currentStep];
    }

    // return n methods
    const remainSteps = n - currentStep;
    // console.log("remainSteps", remainSteps);

    if (remainSteps === 0) {
      memo[currentStep] = 1;
      return memo[currentStep];
    } else if (remainSteps === 1) {
      memo[currentStep] = 1;
      return memo[currentStep];
    } else {
      // console.log("currentStep22", currentStep);
      // currentStep count = dp(currentStep+1) +dp(currentStep+2);
      memo[currentStep] = dp(currentStep + 1, memo) + dp(currentStep + 2, memo);
      // console.log("memo[currentStep]", memo[currentStep]);

      return memo[currentStep];
    }
  };

  return dp(0, {});
}

function climbStairs2(n: number): number {
  const dp: number[] = Array(n).fill(0);
  dp[0] = 1;
  dp[1] = 2;
  for (let i = 2; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n - 1];
}
const solutions = [climbStairs1, climbStairs2];

for (const climbStairs of solutions) {
  Deno.test("067. Climbing Stairs", () => {
    assertEquals(climbStairs(2), 2);
    assertEquals(climbStairs(3), 3);
    assertEquals(climbStairs(4), 5);
    assertEquals(climbStairs(5), 8);
    assertEquals(climbStairs(44), 1134903170);
  });
}

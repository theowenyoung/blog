/**
 * <https://leetcode.com/problems/jump-game/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function canJump(nums: number[]): boolean {
  // for end to start
  // greedy
  const numsLength = nums.length;
  const dp: boolean[] = Array(numsLength);
  dp[numsLength - 1] = true;
  for (let i = numsLength - 2; i >= 0; i--) {
    for (let j = 1; j <= nums[i]; j++) {
      if (dp[i + j] === true) {
        dp[i] = true;
        break;
      }
    }
    if (dp[i] !== true) {
      dp[i] = false;
    }
  }

  return dp[0];
}

Deno.test("jump game 1", () => {
  assertEquals(canJump([2, 3, 1, 1, 4]), true);
});
Deno.test("jump game 2", () => {
  assertEquals(canJump([3, 2, 1, 0, 4]), false);
});

Deno.test("jum game 3", () => {
  assertEquals(canJump([2, 0, 0]), true);
});

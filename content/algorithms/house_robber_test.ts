/**
 * <https://leetcode.com/problems/house-robber/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function rob(nums: number[]): number {
  const maxArray: number[] = Array(nums.length).fill(0);
  if (nums.length === 0) {
    return 0;
  } else {
    maxArray[0] = nums[0];
    maxArray[1] = Math.max(nums[0], nums[1]);
  }

  for (let i = 2; i < nums.length; i++) {
    maxArray[i] = Math.max(maxArray[i - 2] + nums[i], maxArray[i - 1]);
  }

  return maxArray[nums.length - 1];
}
Deno.test("0198. House Robber 1", () => {
  assertEquals(rob([1, 2, 3, 1]), 4);
  assertEquals(rob([2, 7, 9, 3, 1]), 12);
});

Deno.test("0198. House Robber 2", () => {
  assertEquals(rob([2, 1, 1, 2]), 4);
});

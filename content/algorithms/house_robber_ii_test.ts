/**
 * <https://leetcode.com/problems/house-robber-ii/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function rob(nums: number[]): number {
  if (nums.length < 4) {
    return nums.reduce((m, c) => Math.max(m, c), 0);
  }
  const nums1 = nums.slice(1);
  const nums2 = nums.slice(0, nums.length - 1);
  return Math.max(rob1(nums1), rob1(nums2));
}
function rob1(nums: number[]): number {
  const maxArray: number[] = Array(nums.length).fill(0);

  maxArray[0] = nums[0];
  maxArray[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    maxArray[i] = Math.max(maxArray[i - 2] + nums[i], maxArray[i - 1]);
  }

  return maxArray[nums.length - 1];
}
Deno.test("0198. House Robber 1", () => {
  assertEquals(rob([2, 3, 2]), 3);
});

Deno.test("0198. House Robber 2", () => {
  assertEquals(rob([1, 2, 3, 1]), 4);
});

Deno.test("xx", () => {
  assertEquals(rob([1, 2, 3]), 3);
});

Deno.test("rob5", () => {
  assertEquals(rob([200, 3, 140, 20, 10]), 340);
});

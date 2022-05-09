/**
 * <https://leetcode.com/problems/rotate-array/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
/**
 Do not return anything, modify nums in-place instead.
 */
function rotate(nums: number[], k: number): void {
  const newNums = Array(nums.length);
  for (let i = 0; i < nums.length; i++) {
    newNums[(i + k) % nums.length] = nums[i];
  }
  for (let i = 0; i < nums.length; i++) {
    nums[i] = newNums[i];
  }
}

function rotate2(nums: number[], k: number): void {
  for (let i = 0; i < k; i++) {
    nums.unshift(nums.pop()!);
  }
}

Deno.test("rotate 1", () => {
  const nums = [1, 2, 3, 4, 5, 6, 7];
  rotate(nums, 3);
  assertEquals(nums, [5, 6, 7, 1, 2, 3, 4]);
});

Deno.test("rotate 2", () => {
  const nums = [1, 2, 3, 4, 5, 6, 7];
  rotate2(nums, 3);
  assertEquals(nums, [5, 6, 7, 1, 2, 3, 4]);
});

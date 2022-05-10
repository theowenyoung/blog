/**
 * <https://leetcode.com/problems/move-zeroes/>
 Do not return anything, modify nums in-place instead.
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function moveZeroes(nums: number[]): number[] {
  let nextNonZeroAt = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[nextNonZeroAt] = nums[i];
      nextNonZeroAt++;
    }
  }
  for (let i = nextNonZeroAt; i < nums.length; i++) {
    nums[i] = 0;
  }
  return nums;
}

Deno.test("moveZeroes", () => {
  assertEquals(moveZeroes([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
  assertEquals(moveZeroes([0, 0, 1, 2, 3]), [1, 2, 3, 0, 0]);
  assertEquals(moveZeroes([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
  assertEquals(moveZeroes([0, 0, 0, 0, 0]), [0, 0, 0, 0, 0]);
  assertEquals(moveZeroes([0, 0, 0, 0, 0, 0]), [0, 0, 0, 0, 0, 0]);
  assertEquals(moveZeroes([0, 0, 0, 0, 0, 0, 0]), [0, 0, 0, 0, 0, 0, 0]);
});

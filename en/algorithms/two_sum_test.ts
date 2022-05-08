/**
 * <https://leetcode.com/problems/two-sum/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    const currentNumber = nums[i];
    for (let j = i + 1; j < nums.length; j++) {
      const nextNumber = nums[j];
      if (currentNumber + nextNumber === target) {
        return [i, j];
      }
    }
  }
  throw new Error("No two sum solution");
}

Deno.test("two sum test 1", () => {
  const nums = [2, 7, 11, 15];
  const target = 9;
  const result = twoSum(nums, target);
  const expected = [0, 1];
  assertEquals(result, expected);
});

Deno.test("two sum test 2", () => {
  const nums = [3, 2, 4];
  const target = 6;
  const result = twoSum(nums, target);
  const expected = [1, 2];
  assertEquals(result, expected);
});

Deno.test("two sum test 3", () => {
  const nums = [3, 3];
  const target = 6;
  const result = twoSum(nums, target);
  const expected = [0, 1];
  assertEquals(result, expected);
});

/**
 * <https://leetcode.com/problems/squares-of-a-sorted-array/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function sortedSquares(nums: number[]): number[] {
  // split the array into two parts
  const left = [];
  const right = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) {
      left.unshift(nums[i]);
    } else {
      right.push(nums[i]);
    }
  }

  // sort the two parts

  let leftIndex = 0;
  let rightIndex = 0;
  const result = [];
  while (leftIndex < left.length && rightIndex < right.length) {
    if (Math.abs(left[leftIndex]) < Math.abs(right[rightIndex])) {
      result.push(left[leftIndex] * left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex] * right[rightIndex]);
      rightIndex++;
    }
  }

  if (leftIndex < left.length) {
    for (let i = leftIndex; i < left.length; i++) {
      result.push(left[i] * left[i]);
    }
  }
  if (rightIndex < right.length) {
    for (let i = rightIndex; i < right.length; i++) {
      result.push(right[i] * right[i]);
    }
  }
  return result;
}

Deno.test("sortedSquares 1", () => {
  const nums = [-4, -1, 0, 3, 10];
  const result = sortedSquares(nums);
  assertEquals(result, [0, 1, 9, 16, 100]);
});

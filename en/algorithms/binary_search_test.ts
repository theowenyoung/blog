/**
 * <https://leetcode.com/problems/binary-search/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function search(nums: number[], target: number): number {
  return searchWithSpan(nums, target, 0, nums.length - 1);
}

function searchWithSpan(
  nums: number[],
  target: number,
  startIndex: number,
  endIndex: number
): number {
  const currentArray = nums.slice(startIndex, endIndex + 1);
  if (currentArray.length < 2) {
    if (target === currentArray[0]) {
      return startIndex;
    } else {
      return -1;
    }
  }
  const middleIndex = Math.floor((startIndex + endIndex) / 2);
  if (target === nums[middleIndex]) {
    return middleIndex;
  } else if (target < nums[middleIndex]) {
    return searchWithSpan(nums, target, startIndex, middleIndex - 1);
  } else {
    return searchWithSpan(nums, target, middleIndex + 1, endIndex);
  }
}

Deno.test("Binary Search 1", () => {
  const nums = [-1, 0, 3, 5, 9, 12],
    target = 9;
  const result = search(nums, target);
  assertEquals(result, 4);
});

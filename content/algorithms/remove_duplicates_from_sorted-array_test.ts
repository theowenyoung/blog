/**
 * <https://leetcode.com/problems/remove-duplicates-from-sorted-array/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function removeDuplicates(nums: number[]): number {
  if (nums.length < 2) {
    return nums.length;
  }
  let lastNum = nums[0];
  let lastNumIndex = 0;
  let count = 1;
  for (let i = 1; i < nums.length; i++) {
    // i
    if (nums[i] !== lastNum) {
      //
      lastNumIndex++;
      lastNum = nums[i];
      nums[lastNumIndex] = nums[i];
      count++;
    }
  }

  for (let i = lastNumIndex + 1; i < nums.length; i++) {
    delete nums[i];
  }
  // console.log("nums", nums);

  return count;
}

Deno.test("Remove Duplicates from Sorted Array", () => {
  assertEquals(removeDuplicates([1, 1, 2]), 2);
  assertEquals(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), 5);
});

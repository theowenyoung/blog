/**
 * <https://leetcode.com/problems/search-insert-position/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function mySearchInsert(nums: number[], target: number): number {
  let lowIndex = 0;
  let highIndex = nums.length - 1;

  while (lowIndex <= highIndex) {
    if (lowIndex === highIndex) {
      const currentValue = nums[lowIndex];
      if (target > currentValue) {
        return lowIndex + 1;
      } else {
        return lowIndex;
      }
    }

    const midIndex = Math.floor((lowIndex + highIndex) / 2);
    const midNumber = nums[midIndex];
    if (target === midNumber) {
      return midIndex;
    } else if (target > midNumber) {
      lowIndex = midIndex + 1;

      if (lowIndex > highIndex) {
        return highIndex + 1;
      }
    } else {
      highIndex = midIndex - 1;
      if (lowIndex > highIndex) {
        return lowIndex;
      }
    }
  }
  throw new Error("Not found");
}

function answerSearchInsert(nums: number[], target: number): number {
  let lowIndex = 0;
  let highIndex = nums.length - 1;

  while (lowIndex <= highIndex) {
    const midIndex = Math.floor((lowIndex + highIndex) / 2);
    const midNumber = nums[midIndex];
    if (target === midNumber) {
      return midIndex;
    } else if (target > midNumber) {
      lowIndex = midIndex + 1;
    } else {
      highIndex = midIndex - 1;
    }
  }
  return highIndex + 1;
}

const solutions = [mySearchInsert, answerSearchInsert];

for (const searchInsert of solutions) {
  Deno.test(searchInsert.name + " searchInsert 1", () => {
    const nums = [1, 3, 5, 6],
      target = 5;
    assertEquals(searchInsert(nums, target), 2);
  });

  Deno.test(searchInsert.name + " searchInsert 2", () => {
    const nums = [1, 3, 5, 6],
      target = 2;
    assertEquals(searchInsert(nums, target), 1);
  });

  Deno.test(searchInsert.name + " searchInsert 3", () => {
    const nums = [1, 3, 5, 6],
      target = 7;
    assertEquals(searchInsert(nums, target), 4);
  });

  Deno.test(searchInsert.name + " searchInsert 4", () => {
    const nums = [1, 3],
      target = 2;
    assertEquals(searchInsert(nums, target), 1);
  });

  Deno.test(searchInsert.name + " searchInsert 5", () => {
    const nums = [3, 5, 7, 9, 10],
      target = 8;
    assertEquals(searchInsert(nums, target), 3);
  });
}

/**
 * <https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function twoSum(numbers: number[], target: number): number[] {
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[i] + numbers[j] === target) {
        return [i + 1, j + 1];
      }
    }
  }
  throw new Error("No two sum solution");
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

function twoSum2(numbers: number[], target: number): number[] {
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    // use binary search to find complement
    const complementIndex = searchWithSpan(
      numbers,
      complement,
      i + 1,
      numbers.length - 1
    );
    if (complementIndex !== -1) {
      return [i + 1, complementIndex + 1];
    }
  }
  throw new Error("No two sum solution");
}
function twoSum3(numbers: number[], target: number): number[] {
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    const complementIndex = numbers.indexOf(complement, i + 1);
    if (complementIndex !== -1) {
      return [i + 1, complementIndex + 1];
    }
  }
  throw new Error("No two sum solution");
}

function twoSum4(numbers: number[], target: number): number[] {
  let leftIndex = 0;
  let rightIndex = numbers.length - 1;

  while (numbers[leftIndex] + numbers[rightIndex] !== target) {
    if (numbers[leftIndex] + numbers[rightIndex] < target) {
      leftIndex++;
    } else {
      rightIndex--;
    }
  }
  return [leftIndex + 1, rightIndex + 1];
}
Deno.test("twoSum", () => {
  assertEquals(twoSum([2, 7, 11, 15], 9), [1, 2]);
  assertEquals(twoSum([2, 7, 11, 15], 18), [2, 3]);
  assertEquals(twoSum([2, 7, 11, 15], 22), [2, 4]);
});

Deno.test("twoSum 2", () => {
  assertEquals(twoSum2([2, 7, 11, 15], 9), [1, 2]);
  assertEquals(twoSum2([2, 7, 11, 15], 18), [2, 3]);
  assertEquals(twoSum2([2, 7, 11, 15], 22), [2, 4]);
});

Deno.test("twoSum 3", () => {
  assertEquals(twoSum3([2, 7, 11, 15], 9), [1, 2]);
  assertEquals(twoSum3([2, 7, 11, 15], 18), [2, 3]);
  assertEquals(twoSum3([2, 7, 11, 15], 22), [2, 4]);
});
Deno.test("twoSum 4", () => {
  assertEquals(twoSum4([2, 7, 11, 15], 9), [1, 2]);
  assertEquals(twoSum4([2, 7, 11, 15], 18), [2, 3]);
  assertEquals(twoSum4([2, 7, 11, 15], 22), [2, 4]);
});

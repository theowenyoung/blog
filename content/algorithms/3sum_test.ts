/**
 * <https://leetcode.com/problems/3sum/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function threeSum(nums: number[]): number[][] {
  const result: number[][] = [];
  const sortedNums = nums.sort((a, b) => a - b);
  for (let i = 0; i < sortedNums.length; i++) {
    const currentNumber = sortedNums[i];
    if (i > 0 && currentNumber === sortedNums[i - 1]) {
      continue;
    }
    const target = -currentNumber;
    let [start, end] = [i + 1, sortedNums.length - 1];
    while (start < end) {
      const sum = sortedNums[start] + sortedNums[end];
      if (sum === target) {
        result.push([currentNumber, sortedNums[start], sortedNums[end]]);
        start++;
        end--;
        while (start < end && sortedNums[start] === sortedNums[start - 1]) {
          start++;
        }
      } else if (sum < target) {
        start++;
      } else {
        end--;
      }
    }
  }
  return result;
}

Deno.test("three sum test 1", () => {
  const nums = [-1, 0, 1, 2, -1, -4];
  const result = threeSum(nums);
  console.log("result", result);

  const expected = [
    [-1, -1, 2],
    [-1, 0, 1],
  ];
  assertEquals(result, expected);
});

Deno.test("three sum test 2", () => {
  const nums = [-2, 0, 0, 2, 2];
  const result = threeSum(nums);
  const expected = [[-2, 0, 2]];
  assertEquals(result, expected);
});

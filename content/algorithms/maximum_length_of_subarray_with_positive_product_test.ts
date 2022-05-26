/**
 * Maximum Length of Subarray With Positive Product
 * <https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function getMaxLen(nums: number[]): number {
  const lengthOfContinuePositive: number[] = Array(nums.length).fill(1);
  const lengthOfContinueNegative: number[] = Array(nums.length).fill(1);
  lengthOfContinuePositive[0] = nums[0] > 0 ? 1 : 0;
  lengthOfContinueNegative[0] = nums[0] < 0 ? 1 : 0;
  let max = lengthOfContinuePositive[0];
  for (let i = 1; i < nums.length; i++) {
    const val = nums[i];

    if (val === 0) {
      lengthOfContinuePositive[i] = 0;
      lengthOfContinueNegative[i] = 0;
      continue;
    }
    const lastLengthOfPositive = lengthOfContinuePositive[i - 1];
    const lastLengthOfNegative = lengthOfContinueNegative[i - 1];

    if (val > 0) {
      if (lastLengthOfPositive >= 0) {
        lengthOfContinuePositive[i] = lastLengthOfPositive + 1;
      }

      if (lastLengthOfNegative > 0) {
        lengthOfContinueNegative[i] = lastLengthOfNegative + 1;
      } else {
        lengthOfContinueNegative[i] = 0;
      }
    } else {
      // val<0
      if (lastLengthOfPositive > 0) {
        if (lastLengthOfNegative === 0) {
          lengthOfContinuePositive[i] = 0;
        } else {
          lengthOfContinuePositive[i] = lastLengthOfNegative + 1;
        }
      } else if (lastLengthOfPositive === 0) {
        if (lastLengthOfNegative === 0) {
          lengthOfContinuePositive[i] = 0;
        } else {
          lengthOfContinuePositive[i] = lastLengthOfNegative + 1;
        }
      }

      if (lastLengthOfNegative > 0) {
        lengthOfContinueNegative[i] = lastLengthOfPositive + 1;
      } else if (lastLengthOfNegative === 0) {
        lengthOfContinueNegative[i] = lastLengthOfPositive + 1;
      }
    }

    max = Math.max(lengthOfContinuePositive[i], max);
  }
  return max;
}

Deno.test("Maximum Length of Subarray With Positive Product 1", () => {
  assertEquals(getMaxLen([1, -2, -3, 4]), 4);
});

Deno.test("Maximum Length of Subarray With Positive Product 2", () => {
  assertEquals(getMaxLen([0, 1, -2, -3, -4]), 3);
});

Deno.test("Maximum Length of Subarray With Positive Product 3", () => {
  assertEquals(getMaxLen([-16, 0, -5, 2, 2, -13, 11, 8]), 6);
});

Deno.test("Maximum Length of Subarray With Positive Product 4", () => {
  assertEquals(
    getMaxLen([
      5, -20, -20, -39, -5, 0, 0, 0, 36, -32, 0, -7, -10, -7, 21, 20, -12, -34,
      26, 2,
    ]),
    8
  );
});

Deno.test("Maximum Length of Subarray With Positive Product 5", () => {
  assertEquals(getMaxLen([1, 2, 3, 5, -6, 4, 0, 10]), 4);
});

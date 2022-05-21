/**
 * <https://leetcode.com/problems/maximum-subarray/>
 * <https://www.youtube.com/watch?v=2MmGzdiKR9Y>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function maxSubArray1(nums: number[]): number {
  let max = Number.MAX_VALUE * -1;
  for (let i = 1; i <= nums.length; i++) {
    for (let j = 0; j <= nums.length - i; j++) {
      const sum = nums.slice(j, j + i).reduce((prev, curr) => prev + curr, 0);
      if (sum > max) {
        max = sum;
      }
    }
  }
  return max;
}
function maxSubArray2(nums: number[]): number {
  if (nums.length > 0) {
    const dp: number[] = Array(nums.length).fill(0);
    dp[0] = nums[0];
    let max = dp[0];
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] > dp[i - 1] + nums[i]) {
        dp[i] = nums[i];
      } else {
        dp[i] = dp[i - 1] + nums[i];
      }
      if (dp[i] > max) {
        max = dp[i];
      }
    }

    // get the maxims
    return max;
  } else {
    return 0;
  }
}

const solutions = [maxSubArray1, maxSubArray2];

for (const maxSubArray of solutions) {
  Deno.test("maximumSubArray", () => {
    assertEquals(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6);
  });

  Deno.test("maximumSubArray 2", () => {
    assertEquals(maxSubArray([1]), 1);
  });

  Deno.test("maximumSubArray 3", () => {
    assertEquals(maxSubArray([-1]), -1);
  });
}

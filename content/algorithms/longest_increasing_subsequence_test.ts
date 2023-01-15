/**
 * Longest Increasing Subsequence
 * <https://leetcode.com/problems/longest-increasing-subsequence/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function lengthOfLIS(nums: number[]): number {
  const len = nums.length;
  const dp: number[] = Array(len).fill(1);
  let answer = 1;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
        answer = Math.max(answer, dp[i]);
      }
    }
  }

  return answer;
}

Deno.test("Longest Increasing Subsequence 1", () => {
  assertEquals(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]), 4);
});
Deno.test("Longest Increasing Subsequence 2", () => {
  assertEquals(lengthOfLIS([1, 3, 6, 7, 9, 4, 10, 5, 6]), 6);
});

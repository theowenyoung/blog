/**
 * <https://leetcode.com/problems/wiggle-subsequence/>
 * Wiggle Subsequence
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
// up[i] refers to the length of the longest wiggle subsequence obtained so far considering i^{th}i element as the last element of the wiggle subsequence and ending with a rising wiggle.
function wiggleMaxLength(nums: number[]): number {
  if (nums.length < 2) {
    return nums.length;
  }
  const endElementIsRising: number[] = Array(nums.length).fill(1);
  const endElementIsReducing: number[] = Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] > 0) {
      // rising
      endElementIsRising[i] = endElementIsReducing[i - 1] + 1;
      endElementIsReducing[i] = endElementIsReducing[i - 1];
    } else if (nums[i] - nums[i - 1] < 0) {
      endElementIsReducing[i] = endElementIsRising[i - 1] + 1;
      endElementIsRising[i] = endElementIsRising[i - 1];
    } else {
      endElementIsReducing[i] = endElementIsReducing[i - 1];
      endElementIsRising[i] = endElementIsRising[i - 1];
    }
  }
  return Math.max(
    endElementIsReducing[nums.length - 1],
    endElementIsRising[nums.length - 1]
  );
}
Deno.test("Wiggle Subsequence 1", () => {
  assertEquals(wiggleMaxLength([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]), 7);
});

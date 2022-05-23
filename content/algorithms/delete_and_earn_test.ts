/**
 * <https://leetcode.com/problems/delete-and-earn/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function deleteAndEarn(nums: number[]): number {
  const points: Record<string, number> = {};
  let maxNumber = 0;

  // Precompute how many points we gain from taking an element
  for (const num of nums) {
    if (!points[num]) {
      points[num] = 0;
    } else {
      points[num] += num;
    }
    maxNumber = Math.max(maxNumber, num);
  }

  // Declare our array along with base cases
  const maxPoints = Array(maxNumber + 1).fill(0);
  maxPoints[1] = points[1] || 0;

  for (let num = 2; num < maxPoints.length; num++) {
    // Apply recurrence relation
    const gain = points[num] || 0;
    maxPoints[num] = Math.max(maxPoints[num - 1], maxPoints[num - 2] + gain);
  }

  return maxPoints[maxNumber];
}

Deno.test("delete and earn 1", () => {
  assertEquals(deleteAndEarn([3, 4, 2]), 6);
});

Deno.test("delete and earn 2", () => {
  assertEquals(deleteAndEarn([1, 1, 1, 2, 4, 5, 5, 5, 6]), 18);
});

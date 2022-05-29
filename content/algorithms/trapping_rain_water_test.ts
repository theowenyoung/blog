/**
 * Trapping Rain Water
 * <https://leetcode.com/problems/trapping-rain-water/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function trap(height: number[]): number {
  let sum = 0;

  const maxLeft: number[] = Array(height.length).fill(0);
  const maxRight: number[] = Array(height.length).fill(0);

  for (let i = 0; i < height.length; i++) {
    maxLeft[i] = Math.max(height[i], maxLeft[i - 1] || 0);
  }
  for (let i = height.length - 1; i >= 0; i--) {
    maxRight[i] = Math.max(height[i], maxRight[i + 1] || 0);
  }

  for (let i = height.length - 1; i >= 0; i--) {
    sum += Math.min(maxRight[i], maxLeft[i]) - height[i];
  }

  return sum;
}

Deno.test("trap 1", () => {
  assertEquals(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), 6);
});

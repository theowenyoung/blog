/**
 * <https://leetcode.com/problems/container-with-most-water/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maxArea1(height: number[]): number {
  let maxArea = 0;

  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      const area = Math.min(height[i], height[j]) * (j - i);
      if (area > maxArea) {
        maxArea = area;
      }
    }
  }
  return maxArea;
}

function maxArea(height: number[]): number {
  let maxArea = 0;
  let left = 0;
  let right = height.length - 1;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    if (area > maxArea) {
      maxArea = area;
    }
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxArea;
}

const solutions = [maxArea1, maxArea];
for (const solution of solutions) {
  Deno.test(solution.name, () => {
    assertEquals(solution([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
  });
}

/**
 * Triangle: <https://leetcode.com/problems/triangle/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function minimumTotal(triangle: number[][]): number {
  const dp = Array(triangle.length)
    .fill(0)
    .map((_, i) => Array(triangle[i].length).fill(0));

  // from bottom to top
  for (let j = 0; j < triangle[triangle.length - 1].length; j++) {
    dp[triangle.length - 1][j] = triangle[triangle.length - 1][j];
  }

  for (let i = triangle.length - 2; i >= 0; i--) {
    for (let j = 0; j < triangle[i].length; j++) {
      dp[i][j] = Math.min(dp[i + 1][j], dp[i + 1][j + 1]) + triangle[i][j];
    }
  }
  return dp[0][0];
}

Deno.test("064. Minimum Path Sum", () => {
  assertEquals(minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]), 11);
});

Deno.test("064. Minimum Path Sum 2", () => {
  assertEquals(minimumTotal([[-1], [2, 3], [1, -1, -3]]), -1);
});

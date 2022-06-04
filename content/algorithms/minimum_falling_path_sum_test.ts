/**
 * Minimum Falling Path Sum
 * <https://leetcode.com/problems/minimum-falling-path-sum/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function minFallingPathSum(matrix: number[][]): number {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const dp: number[][] = Array.from(Array(rows), () => Array(cols + 2));

  for (let i = 0; i < rows; i++) {
    for (let j = 1; j < cols + 1; j++) {
      dp[i][0] = Number.MAX_VALUE;
      dp[i][cols + 1] = Number.MAX_VALUE;

      if (i === 0) {
        dp[i][j] = matrix[i][j - 1];
      } else {
        dp[i][j] =
          Math.min(dp[i - 1][j], dp[i - 1][j + 1], dp[i - 1][j - 1]) +
          matrix[i][j - 1];
      }
    }
  }
  // get the minist value
  let min = dp[rows - 1][1];
  for (let i = 2; i < dp[rows - 1].length - 1; i++) {
    if (dp[rows - 1][i] < min) {
      min = dp[rows - 1][i];
    }
  }
  return min;
}

Deno.test("Minimum Falling Path Sum 1", () => {
  assertEquals(
    minFallingPathSum([
      [2, 1, 3],
      [6, 5, 4],
      [7, 8, 9],
    ]),
    13
  );
});

Deno.test("Minimum Falling Path Sum 2", () => {
  assertEquals(
    minFallingPathSum([
      [-19, 57],
      [-40, -5],
    ]),
    -59
  );
});

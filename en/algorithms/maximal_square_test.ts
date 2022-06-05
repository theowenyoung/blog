/**
 * Maximal Square
 * <https://leetcode.com/problems/maximal-square/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function maximalSquare(matrix: string[][]): number {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const dp: number[][] = Array.from(Array(rows), () => Array(cols));
  let max = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const val = parseInt(matrix[i][j]);

      if (val === 0) {
        dp[i][j] = 0;
      } else {
        const topVal = i - 1 >= 0 ? dp[i - 1][j] : 0;
        const leftVal = j - 1 >= 0 ? dp[i][j - 1] : 0;
        const topLeftVal = i - 1 >= 0 && j - 1 >= 0 ? dp[i - 1][j - 1] : 0;
        dp[i][j] = Math.min(topVal, leftVal, topLeftVal) + val;
      }
      if (dp[i][j] > max) {
        max = dp[i][j];
      }
    }
  }
  return max * max;
}

Deno.test("Maximal Square", () => {
  assertEquals(
    maximalSquare([
      ["1", "0", "1", "0", "0"],
      ["1", "0", "1", "1", "1"],
      ["1", "1", "1", "1", "1"],
      ["1", "0", "0", "1", "0"],
    ]),
    4
  );
});

Deno.test("MaximalSquare 2", () => {
  assertEquals(
    maximalSquare([
      ["1", "1", "1", "1", "0"],
      ["1", "1", "1", "1", "0"],
      ["1", "1", "1", "1", "1"],
      ["1", "1", "1", "1", "1"],
      ["0", "0", "1", "1", "1"],
    ]),
    16
  );
});

/**
 * As Far from Land as Possible
 * <https://leetcode.com/problems/as-far-from-land-as-possible/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function maxDistance(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;

  const dp: number[][] = Array.from(Array(rows), () => new Array(cols));
  let isAllZero = true;
  let isAll1 = true;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 1) {
        isAllZero = false;
        dp[i][j] = 0;
      } else {
        isAll1 = false;
        dp[i][j] = Number.MAX_VALUE - 10000;
      }
    }
  }
  if (isAllZero || isAll1) {
    return -1;
  }

  // from top - down, left -right
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (j - 1 >= 0 && i - 1 >= 0) {
        // both left && top exists
        const left = dp[i][j - 1];
        const top = dp[i - 1][j];
        dp[i][j] = Math.min(dp[i][j], Math.min(left, top) + 1);
      } else if (j - 1 >= 0 && i - 1 < 0) {
        const left = dp[i][j - 1];
        dp[i][j] = Math.min(dp[i][j], left + 1);
      } else if (i - 1 >= 0 && j - 1 < 0) {
        const top = dp[i - 1][j];
        dp[i][j] = Math.min(dp[i][j], top + 1);
      }
    }
  }
  let max = 0;
  // from down -> top, right - left
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      if (j + 1 < cols && i + 1 < rows) {
        // both left && top exists
        const right = dp[i][j + 1];
        const bottom = dp[i + 1][j];
        dp[i][j] = Math.min(dp[i][j], Math.min(right, bottom) + 1);
      } else if (j + 1 < cols && i + 1 >= rows) {
        const right = dp[i][j + 1];
        dp[i][j] = Math.min(dp[i][j], right + 1);
      } else if (i + 1 < rows && j + 1 >= cols) {
        const bottom = dp[i + 1][j];
        dp[i][j] = Math.min(dp[i][j], bottom + 1);
      }
      if (dp[i][j] > max) {
        max = dp[i][j];
      }
    }
  }
  // get most dp
  return max;
}

Deno.test("as far 1", () => {
  assertEquals(
    maxDistance([
      [1, 0, 1],
      [0, 0, 0],
      [1, 0, 1],
    ]),
    2
  );
});

Deno.test("as far 2", () => {
  assertEquals(
    maxDistance([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]),
    4
  );
});

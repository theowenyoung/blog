/**
 * Range Sum Query 2D - Immutable
 * <https://leetcode.com/problems/range-sum-query-2d-immutable/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

class NumMatrix {
  dp: number[][];
  constructor(mat: number[][]) {
    const rows = mat.length;
    const cols = mat[0].length;
    const dp = Array.from(Array(rows), () => Array(cols));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === 0 && j == 0) {
          dp[i][j] = mat[i][j];
          continue;
        }
        const topSum = i - 1 >= 0 ? dp[i - 1][j] : 0;
        const leftSum = j - 1 >= 0 ? dp[i][j - 1] : 0;
        const topLeft = i - 1 >= 0 && j - 1 >= 0 ? dp[i - 1][j - 1] : 0;
        dp[i][j] = topSum + leftSum - topLeft + mat[i][j];
      }
    }
    this.dp = dp;
  }

  sumRegion(row1: number, col1: number, row2: number, col2: number): number {
    const dp = this.dp;

    const topRow = row1 - 1 >= 0 ? row1 - 1 : -1;
    const leftCol = col1 - 1 >= 0 ? col1 - 1 : -1;
    const bottomRow = row2;
    const rightCol = col2;
    const topSum = topRow >= 0 ? dp[topRow][rightCol] : 0;
    const leftSum = leftCol >= 0 ? dp[bottomRow][leftCol] : 0;
    const topLeftSum = leftCol >= 0 && topRow >= 0 ? dp[topRow][leftCol] : 0;
    const totalSum = dp[bottomRow][rightCol];
    const area = totalSum - leftSum - topSum + topLeftSum;
    // console.log(
    //   "i",
    //   i,
    //   "j",
    //   j,
    //   "topSum",
    //   topSum,
    //   "leftSum",
    //   leftSum,
    //   "topLeftSum",
    //   topLeftSum,
    //   "totalSum",
    //   totalSum,
    //   "area",
    //   area
    // );

    return area;
  }
}

/**
 * Your NumMatrix object will be instantiated and called as such:
 * var obj = new NumMatrix(matrix)
 * var param_1 = obj.sumRegion(row1,col1,row2,col2)
 */
Deno.test("Range Sum Query 2D - Immutable 1", () => {
  const obj = new NumMatrix([
    [3, 0, 1, 4, 2],
    [5, 6, 3, 2, 1],
    [1, 2, 0, 1, 5],
    [4, 1, 0, 1, 7],
    [1, 0, 3, 0, 5],
  ]);
  const param_1 = obj.sumRegion(2, 1, 4, 3);
  assertEquals(param_1, 8);
});

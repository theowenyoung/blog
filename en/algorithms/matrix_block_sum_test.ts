/**
 * Matrix Block Sum
 * <https://leetcode.com/problems/matrix-block-sum/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function matrixBlockSum(mat: number[][], k: number): number[][] {
  // make dp, calculate(0,0) -> (i,j)  area
  // (i,j), k area = area(i+k,j+k)-area(i+k,j)-area(i,j+k)+area(i-k,j-k)
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
  const newMat = Array.from(Array(rows), () => Array(cols));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const topRow = i - k - 1 >= 0 ? i - k - 1 : -1;
      const leftCol = j - k - 1 >= 0 ? j - k - 1 : -1;

      const bottomRow = i + k >= rows ? rows - 1 : i + k;
      const rightCol = j + k >= cols ? cols - 1 : j + k;

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

      newMat[i][j] = area;
    }
  }
  return newMat;
}
Deno.test("Matrix Block Sum 1", () => {
  assertEquals(
    matrixBlockSum(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      1
    ),
    [
      [12, 21, 16],
      [27, 45, 33],
      [24, 39, 28],
    ]
  );
});

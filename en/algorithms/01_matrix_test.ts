/**
 * <https://leetcode.com/problems/01-matrix/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function dfs(
  mat: number[][],
  seen: Set<string>,
  result: number[],
  r: number,
  c: number
): number {
  return 0;
}

function updateMatrix(mat: number[][]): number[][] {
  const rLen = mat.length;
  const cLen = mat[0].length;
  const newMatrix: number[][] = [];
  for (let i = 0; i < rLen; i++) {
    for (let j = 0; j < cLen; j++) {
      if (!newMatrix[i]) {
        newMatrix[i] = [];
      }
      if (mat[i][j] === 0) {
        newMatrix[i][j] = 0;
        continue;
      }
      const seen: Set<string> = new Set();
      const leastGap = dfs(mat, seen, [], i, j);

      newMatrix[i][j] = leastGap;
    }
  }
  return newMatrix;
}

Deno.test("01-matrix", () => {
  assertEquals(
    updateMatrix([
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ]),
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 2, 1],
    ]
  );
});

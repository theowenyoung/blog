/**
 * <https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function kWeakestRows(mat: number[][], k: number): number[] {
  const rowMap = new Map<number, number>();
  for (let i = 0; i < mat.length; i++) {
    let sum = 0;
    for (let j = 0; j < mat[i].length; j++) {
      sum += mat[i][j];
    }
    rowMap.set(i, sum);
  }
  const sorted = Array.from(rowMap.entries()).sort((a, b) => a[1] - b[1]);
  const result = [];
  for (let i = 0; i < k; i++) {
    result.push(sorted[i][0]);
  }
  return result;
}

Deno.test("kWeakestRows 1", () => {
  const mat = [
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ];
  const k = 3;
  const result = kWeakestRows(mat, k);
  assertEquals(result, [2, 0, 3]);
});

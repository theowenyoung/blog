/**
 * <https://leetcode.com/problems/pascals-triangle/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function generate(numRows: number): number[][] {
  const triangle: number[][] = Array.from(Array(numRows), (_, i) => {
    return new Array(i + 1);
  });
  triangle[0][0] = 1;
  for (let i = 1; i < numRows; i++) {
    triangle[i][0] = 1;
    triangle[i][triangle[i].length - 1] = 1;
    for (let j = 1; j < i; j++) {
      triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
    }
  }

  return triangle;
}

Deno.test("Pascal's Triangle 1", () => {
  assertEquals(generate(5), [
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1],
    [1, 4, 6, 4, 1],
  ]);
});

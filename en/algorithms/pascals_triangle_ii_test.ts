/**
 * <https://leetcode.com/problems/pascals-triangle-ii/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function getRow(rowIndex: number): number[] {
  const currentRow = Array(rowIndex + 1).fill(0);
  if (rowIndex === 0) {
    return [1];
  }
  currentRow[0] = 1;
  currentRow[1] = 1;
  for (let i = 2; i <= rowIndex; i++) {
    let currentValue = currentRow[0];
    currentRow[i] = 1;
    for (let j = 1; j < i; j++) {
      const temp = currentRow[j];
      currentRow[j] = currentValue + currentRow[j];
      currentValue = temp;
    }
  }

  return currentRow;
}

Deno.test("Pascal's Triangle II 1", () => {
  assertEquals(getRow(3), [1, 3, 3, 1]);
});

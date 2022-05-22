/**
 * <https://leetcode.com/problems/number-of-closed-islands/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function isClosedIsland(grid: number[][], i: number, j: number): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  if (grid[i][j] === 1) {
    return true;
  }
  if (grid[i][j] === -1) {
    // seen
    return true;
  }
  if (i <= 0 || j <= 0 || i >= rows - 1 || j >= cols - 1) {
    return false;
  }
  grid[i][j] = -1;
  const allDirections: boolean[] = [];
  for (const [dr, dc] of directions) {
    const newRow = i + dr;
    const newCol = j + dc;
    allDirections.push(isClosedIsland(grid, newRow, newCol));
  }

  return allDirections.every((v) => v);
}

function closedIsland(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  for (let i = 1; i < rows - 1; i++) {
    for (let j = 1; j < cols - 1; j++) {
      if (grid[i][j] === 0) {
        if (isClosedIsland(grid, i, j)) {
          count++;
        }
      }
    }
  }
  return count;
}

Deno.test("Number of Closed Islands 1", () => {
  assertEquals(
    closedIsland([
      [1, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 1, 1, 0],
      [1, 0, 1, 0, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0],
    ]),
    2
  );
});
Deno.test("Number of Closed Islands 2", () => {
  assertEquals(
    closedIsland([
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
    ]),
    1
  );
});
Deno.test("Number of Closed Islands 3", () => {
  assertEquals(
    closedIsland([
      [0, 0, 1, 1, 0, 1, 0, 0, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
      [1, 0, 1, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    ]),
    5
  );
});

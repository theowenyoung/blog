/**
 * <https://leetcode.com/problems/number-of-islands/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function numIslands(grid: string[][]): number {
  const queue: number[][] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const currentValue = grid[i][j];

      if (currentValue === "1") {
        // islands
        queue.push([i, j]);
      }
    }
  }
  const seen: Set<string> = new Set();
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  let count = 0;
  for (let i = 0; i < queue.length; i++) {
    const currentPosition = queue[i];
    const currentRow = currentPosition[0];
    const currentCol = currentPosition[1];

    if (seen.has(`${currentRow}-${currentCol}`)) {
      continue;
    }
    count++;
    const newQueue: number[][] = [[currentRow, currentCol]];

    while (newQueue.length > 0) {
      // try to spread to four directions
      const currentPosition = newQueue.shift()!;
      const currentRow = currentPosition[0];
      const currentCol = currentPosition[1];

      for (const [dr, dc] of directions) {
        const newRow = currentRow + dr;
        const newCol = currentCol + dc;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          // legal
          const key = `${newRow}-${newCol}`;
          if (grid[newRow][newCol] === "1" && !seen.has(key)) {
            seen.add(key);
            newQueue.push([newRow, newCol]);
          }
        }
      }
    }
  }
  return count;
}

Deno.test("divide two integrers", () => {
  assertEquals(
    numIslands([
      ["1", "1", "1", "1", "0"],
      ["1", "1", "0", "1", "0"],
      ["1", "1", "0", "0", "0"],
      ["0", "0", "0", "0", "0"],
    ]),
    1
  );
});

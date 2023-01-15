/**
 * <https://leetcode.com/problems/rotting-oranges/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function orangesRotting(grid: number[][]): number {
  const queue: [number, number][][] = [[]];
  const rows = grid.length;
  const cols = grid[0].length;
  let freshCount = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) {
        queue[0].push([i, j]);
      } else if (grid[i][j] === 1) {
        freshCount++;
      }
    }
  }
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  // bfs
  let minutes = 0;
  while (queue.length > 0 && freshCount > 0) {
    const currentMinutesArray = queue.shift()!;
    const currentNewArray: [number, number][] = [];
    while (currentMinutesArray.length > 0 && freshCount > 0) {
      const currentBad = currentMinutesArray.shift()!;
      for (const [dr, dc] of directions) {
        const newRow = currentBad[0] + dr;
        const newCol = currentBad[1] + dc;
        if (newRow >= 0 && newCol >= 0 && newRow < rows && newCol < cols) {
          const newValue = grid[newRow][newCol];

          if (newValue === 1) {
            // infect it
            grid[newRow][newCol] = 2;
            freshCount--;
            currentNewArray.push([newRow, newCol]);
          }
        }
      }
    }
    minutes++;
    if (currentNewArray.length > 0) {
      queue.push(currentNewArray);
    }
  }

  if (freshCount === 0) {
    return minutes;
  } else {
    return -1;
  }
}

Deno.test("rotting-oranges", () => {
  assertEquals(
    orangesRotting([
      [2, 1, 1],
      [1, 1, 0],
      [0, 1, 1],
    ]),
    4
  );
});

Deno.test("rotting-oranges 2", () => {
  assertEquals(
    orangesRotting([
      [2, 1, 1],
      [0, 1, 1],
      [1, 0, 1],
    ]),
    -1
  );
});

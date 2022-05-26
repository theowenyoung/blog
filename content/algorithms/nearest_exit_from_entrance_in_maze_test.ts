/**
 * Nearest Exit from Entrance in Maze
 * <https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function nearestExit(maze: string[][], entrance: number[]): number {
  // found all exit
  const exit: Record<string, boolean> = {};
  const rows = maze.length;
  const cols = maze[0].length;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const val = maze[i][j];
      if (
        val === "." &&
        !(i === entrance[0] && j === entrance[1]) &&
        (i === 0 || j === 0 || i === rows - 1 || j === cols - 1)
      ) {
        exit[`${i}-${j}`] = true;
      }
    }
  }
  // console.log("exit", exit);

  const isExit = (i: number, j: number): boolean => {
    return exit[`${i}-${j}`] || false;
  };

  // bfs search
  const visit: Set<string> = new Set();
  const isValid = (i: number, j: number): boolean => {
    if (i < 0 || j < 0 || i >= rows || j >= cols) {
      return false;
    }
    if (maze[i][j] === "+") {
      return false;
    }

    return true;
  };
  const bfs = (i: number, j: number): number => {
    const queue: number[][][] = [[[i, j]]];
    const directions: number[][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    let step = 0;
    while (queue.length) {
      const currentQueue = queue.shift()!;
      // console.log("currentQueue", currentQueue);

      const nextQueue: number[][] = [];
      for (const position of currentQueue) {
        const row = position[0];
        const col = position[1];

        if (isExit(row, col)) {
          return step;
        }

        const key = `${row}-${col}`;
        if (visit.has(key) || !isValid(i, j)) {
          continue;
        }
        visit.add(key);

        for (const [dr, dc] of directions) {
          // add to nextQueue
          const newRow = dr + row;
          const newCol = dc + col;

          if (isValid(newRow, newCol)) {
            nextQueue.push([newRow, newCol]);
          }
        }
      }
      if (nextQueue.length > 0) {
        queue.push(nextQueue);
      }
      step++;
    }

    return -1;
  };

  return bfs(entrance[0], entrance[1]);
}

Deno.test("Nearest Exit from Entrance in Maze 1", () => {
  const maze = [
      ["+", "+", ".", "+"],
      [".", ".", ".", "+"],
      ["+", "+", "+", "."],
    ],
    entrance = [1, 2];
  assertEquals(nearestExit(maze, entrance), 1);
});

Deno.test("Nearest Exit from Entrance in Maze 2", () => {
  const maze = [
      ["+", "+", "+"],
      [".", ".", "."],
      ["+", "+", "+"],
    ],
    entrance = [1, 0];
  assertEquals(nearestExit(maze, entrance), 2);
});

Deno.test("Nearest Exit from Entrance in Maze 3", () => {
  const maze = [
      ["+", "+", ".", "+"],
      [".", ".", ".", "+"],
      ["+", "+", "+", "."],
    ],
    entrance = [1, 2];
  assertEquals(nearestExit(maze, entrance), 1);
});

Deno.test("Nearest Exit from Entrance in Maze 4", () => {
  const maze = [
      ["+", ".", "+", "+", "+", "+", "+"],
      ["+", ".", "+", ".", ".", ".", "+"],
      ["+", ".", "+", ".", "+", ".", "+"],
      ["+", ".", ".", ".", "+", ".", "+"],
      ["+", "+", "+", "+", "+", ".", "+"],
    ],
    entrance = [3, 2];
  assertEquals(nearestExit(maze, entrance), 4);
});

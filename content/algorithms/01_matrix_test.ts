/**
 * <https://leetcode.com/problems/01-matrix/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function updateMatrixWithDP(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows == 0) {
    return matrix;
  }
  const cols = matrix[0].length;
  const dist = Array(rows)
    .fill(undefined)
    .map(() => Array(cols).fill(Number.MAX_VALUE - 1));

  //First pass: check for left and top
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === 0) {
        dist[i][j] = 0;
      } else {
        if (i > 0) {
          dist[i][j] = Math.min(dist[i][j], dist[i - 1][j] + 1);
        }
        if (j > 0) {
          dist[i][j] = Math.min(dist[i][j], dist[i][j - 1] + 1);
        }
      }
    }
  }

  //Second pass: check for bottom and right
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      if (i < rows - 1) dist[i][j] = Math.min(dist[i][j], dist[i + 1][j] + 1);
      if (j < cols - 1) dist[i][j] = Math.min(dist[i][j], dist[i][j + 1] + 1);
    }
  }

  return dist;
}

function updateMatrixWithBFS1(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows == 0) {
    return matrix;
  }
  const cols = matrix[0].length;
  const dist = Array(rows)
    .fill(undefined)
    .map(() => Array(cols).fill(0));

  // find all 1
  const queue: number[][] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === 0) {
        dist[i][j] === 0;
      } else {
        queue.push([i, j]);
      }
    }
  }

  // start bfs
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  while (queue.length > 0) {
    // move to find 0;

    const [i, j] = queue.shift()!;

    let isContinue = true;
    let distance = 0;
    let breadQueue: number[][] = [[i, j, 0]];

    while (isContinue && breadQueue.length) {
      const tempQueue: number[][] = [];
      for (let q = 0; q < breadQueue.length && isContinue; q++) {
        const [currentI, currentJ, currentDistance] = breadQueue[q];
        for (const [dr, dc] of directions) {
          const newRow = currentI + dr;
          const newCollom = currentJ + dc;

          if (
            newRow >= 0 &&
            newRow < rows &&
            newCollom < cols &&
            newCollom >= 0
          ) {
            // valid
            const newValue = matrix[newRow][newCollom];
            if (newValue === 0) {
              distance = currentDistance + 1;
              isContinue = false;
              break;
            } else {
              tempQueue.push([newRow, newCollom, currentDistance + 1]);
            }
          }
        }
      }
      breadQueue = tempQueue;
    }
    // console.log("distance", distance);

    dist[i][j] = distance;
  }
  return dist;
}

function updateMatrixWithBFS(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows == 0) {
    return matrix;
  }
  const cols = matrix[0].length;
  const dist = Array(rows)
    .fill(undefined)
    .map(() => Array(cols).fill(Number.MAX_VALUE));

  // find all 0
  const queue: number[][] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === 0) {
        dist[i][j] = 0;
        queue.push([i, j]);
      }
    }
  }
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  while (queue.length > 0) {
    // move to 4 directions
    const [i, j] = queue.shift()!;
    for (const [dr, dc] of directions) {
      const newRow = i + dr;
      const newCollom = j + dc;

      if (newRow >= 0 && newRow < rows && newCollom < cols && newCollom >= 0) {
        // valid elements
        const currentDistance = dist[newRow][newCollom];

        if (dist[i][j] + 1 < currentDistance) {
          dist[newRow][newCollom] = dist[i][j] + 1;
          queue.push([newRow, newCollom]);
        }
      }
    }
  }

  return dist;
}

const solutions = [updateMatrixWithDP, updateMatrixWithBFS];

for (const updateMatrix of solutions) {
  Deno.test("01-matrix 1", () => {
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
  Deno.test("01-matrix 3", () => {
    assertEquals(
      updateMatrix([
        [0, 1, 1, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
      ]),
      [
        [0, 1, 1, 2, 3],
        [1, 1, 0, 1, 2],
        [2, 2, 1, 2, 3],
      ]
    );
  });

  Deno.test("01-matrix 4", () => {
    assertEquals(
      updateMatrix([
        [1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
      ]),
      [
        [3, 2, 1, 2, 3],
        [2, 1, 0, 1, 2],
        [3, 2, 1, 2, 3],
      ]
    );
  });
  Deno.test("01-matrix 2", () => {
    assertEquals(
      updateMatrix([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [0, 0, 0],
      ]),
      [
        [19, 19, 19],
        [18, 18, 18],
        [17, 17, 17],
        [16, 16, 16],
        [15, 15, 15],
        [14, 14, 14],
        [13, 13, 13],
        [12, 12, 12],
        [11, 11, 11],
        [10, 10, 10],
        [9, 9, 9],
        [8, 8, 8],
        [7, 7, 7],
        [6, 6, 6],
        [5, 5, 5],
        [4, 4, 4],
        [3, 3, 3],
        [2, 2, 2],
        [1, 1, 1],
        [0, 0, 0],
      ]
    );
  });
}

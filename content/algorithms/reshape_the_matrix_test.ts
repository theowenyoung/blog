/**
 * <https://leetcode.com/problems/reshape-the-matrix/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function matrixReshape1(mat: number[][], r: number, c: number): number[][] {
  const newMat: number[][] = [];
  const queue: number[] = [];
  for (const row of mat) {
    for (const col of row) {
      queue.push(col);
    }
  }
  // console.log("queue", queue, queue.length, r);
  const finalCols = queue.length / r;
  // console.log("finalCols", finalCols);

  if (finalCols !== c) {
    // illegel
    return mat;
  }
  // console.log("finalCols", finalCols);

  for (let i = 0; i < r; i++) {
    newMat.push([]);
    for (let j = 0; j < finalCols; j++) {
      const val = queue.shift();
      // console.log("val", val);

      if (val !== undefined) {
        newMat[i].push(val);
        // console.log("newMat", newMat);
      } else {
        return newMat;
      }
    }
  }
  return newMat;
}

function matrixReshape2(mat: number[][], r: number, c: number): number[][] {
  const rows = mat.length;
  const cols = mat[0].length;
  if (rows * cols !== r * c) {
    return mat;
  }
  const newMat: number[][] = Array.from(Array(r), () => new Array(c));

  for (let i = 0; i < r * c; i++) {
    const newRow = Math.floor(i / c);

    const newCol = i % c;

    newMat[newRow][newCol] = mat[Math.floor(i / cols)][i % cols];
  }
  return newMat;
}

const solutions = [matrixReshape1, matrixReshape2];

for (const matrixReshape of solutions) {
  Deno.test("Reshape the Matrix", () => {
    assertEquals(
      matrixReshape(
        [
          [1, 2],
          [3, 4],
        ],
        1,
        4
      ),
      [[1, 2, 3, 4]]
    );
  });
  Deno.test("Reshape the Matrix 2", () => {
    assertEquals(
      matrixReshape(
        [
          [1, 2],
          [3, 4],
        ],
        2,
        4
      ),
      [
        [1, 2],
        [3, 4],
      ]
    );
  });
}

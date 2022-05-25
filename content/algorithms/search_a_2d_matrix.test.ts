/**
 * 74. Search a 2D Matrix
 * <https://leetcode.com/problems/search-a-2d-matrix/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function searchMatrix(matrix: number[][], target: number): boolean {
  return searchMatrixWithSpan(matrix, target, 0, matrix.length - 1);
}
function searchMatrixWithSpan(
  matrix: number[][],
  target: number,
  startRow: number,
  endRow: number
): boolean {
  // binary

  if (startRow > endRow) {
    return false;
  }
  const cols = matrix[0].length;

  // target

  const middleRowIndex = startRow + Math.floor((endRow - startRow) / 2);
  if (middleRowIndex < 0) {
    return false;
  }

  const rowStart = matrix[middleRowIndex][0];
  const rowEnd = matrix[middleRowIndex][cols - 1];

  if (target >= rowStart && target <= rowEnd) {
    // search row
    return searchWithSpan(matrix[middleRowIndex], target, 0, cols - 1) !== -1
      ? true
      : false;
  } else if (target > rowEnd) {
    return searchMatrixWithSpan(matrix, target, middleRowIndex + 1, endRow);
  } else {
    return searchMatrixWithSpan(matrix, target, startRow, middleRowIndex - 1);
  }
}
function searchWithSpan(
  nums: number[],
  target: number,
  startIndex: number,
  endIndex: number
): number {
  const currentArray = nums.slice(startIndex, endIndex + 1);
  if (currentArray.length < 2) {
    if (target === currentArray[0]) {
      return startIndex;
    } else {
      return -1;
    }
  }
  const middleIndex = Math.floor((startIndex + endIndex) / 2);
  if (target === nums[middleIndex]) {
    return middleIndex;
  } else if (target < nums[middleIndex]) {
    return searchWithSpan(nums, target, startIndex, middleIndex - 1);
  } else {
    return searchWithSpan(nums, target, middleIndex + 1, endIndex);
  }
}
Deno.test("Search a 2D Matrix 1", () => {
  assertEquals(
    searchMatrix(
      [
        [1, 3, 5, 7],
        [10, 11, 16, 20],
        [23, 30, 34, 60],
      ],
      3
    ),
    true
  );
});

Deno.test("Search a 2D Matrix 1", () => {
  assertEquals(searchMatrix([[1]], 0), false);
});

Deno.test("Search a 2D Matrix 2", () => {
  assertEquals(searchMatrix([[1], [3]], 2), false);
});

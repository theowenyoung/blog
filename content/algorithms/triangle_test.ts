/**
 * Triangle: <https://leetcode.com/problems/triangle/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

const sortSortedGroups = (
  leftArray: number[],
  rightArray: number[]
): number[] => {
  let newArray = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
    if (leftArray[leftIndex] < rightArray[rightIndex]) {
      newArray.push(leftArray[leftIndex]);
      leftIndex++;
    } else {
      newArray.push(rightArray[rightIndex]);
      rightIndex++;
    }
  }
  if (leftIndex < leftArray.length) {
    newArray = newArray.concat(leftArray.slice(leftIndex));
  }
  if (rightIndex < rightArray.length) {
    newArray = newArray.concat(rightArray.slice(rightIndex));
  }

  return newArray;
};
export const mergeSort = (arr: number[]): number[] => {
  if (arr.length < 2) {
    return arr;
  }
  const middleIndex = Math.floor(arr.length / 2);
  const leftArray = arr.slice(0, middleIndex);
  const rightArray = arr.slice(middleIndex);
  return sortSortedGroups(mergeSort(leftArray), mergeSort(rightArray));
};
function minimumTotal(triangle: number[][]): number {
  let result = 0;
  for (let i = 0; i < triangle.length; i++) {
    const currentArr = triangle[i];

    // get minimum item
    const min = mergeSort(currentArr)[0];
    result += min;
  }
  return result;
}

Deno.test("064. Minimum Path Sum", () => {
  assertEquals(minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]), 11);
});

Deno.test("064. Minimum Path Sum 2", () => {
  assertEquals(minimumTotal([[-1], [2, 3], [1, -1, -3]]), -1);
});

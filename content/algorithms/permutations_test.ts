/**
 * <https://leetcode.com/problems/permutations/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
const getRestNumber = (array: number[], index: number): number[] => {
  return array.slice(0, index).concat(array.slice(index + 1));
};
function permute(nums: number[]): number[][] {
  const result: number[][] = [];

  const backtrack = (currentNumber: number[], restNumber: number[]) => {
    if (currentNumber.length === nums.length) {
      result.push(currentNumber);
      return;
    }
    for (let i = 0; i < restNumber.length; i++) {
      backtrack(
        [...currentNumber, restNumber[i]],
        getRestNumber(restNumber, i)
      );
    }
  };

  backtrack([], nums);

  return result;
}

Deno.test("permutations 1", () => {
  assertEquals(permute([1, 2, 3]), [
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ]);
});

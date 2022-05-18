/**
 * <https://leetcode.com/problems/combinations/>
 */
import { assertArrayIncludes } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function combine1(n: number, k: number): number[][] {
  const result: number[][] = [];
  const allNumbers = Array(n)
    .fill(n)
    .map((_, i) => i + 1);
  const backtrack = (currentNumber: number[], restNumbers: number[]) => {
    if (currentNumber.length === k) {
      result.push(currentNumber);
      return;
    } else if (restNumbers.length + currentNumber.length < k) {
      return;
    }
    for (let i = 0; i < restNumbers.length; i++) {
      backtrack(
        [...currentNumber, restNumbers[i]],
        getRestNumber(restNumbers, i)
      );
    }
  };
  const getRestNumber = (array: number[], index: number): number[] => {
    return array.slice(index + 1);
  };
  for (let i = 0; i < allNumbers.length; i++) {
    backtrack([allNumbers[i]], getRestNumber(allNumbers, i));
  }
  return result;
}
function combine2(n: number, k: number): number[][] {
  const result: number[][] = [];
  const backtrack = (start: number, currentNumber: number[]) => {
    if (currentNumber.length === k) {
      result.push(currentNumber);
      return;
    }
    for (let i = start; i <= n; i++) {
      backtrack(i + 1, [...currentNumber, i]);
    }
  };

  backtrack(1, []);

  return result;
}

const solutions = [combine1, combine2];

for (const combine of solutions) {
  Deno.test("combinations 1", () => {
    assertArrayIncludes(combine(4, 2), [
      [2, 4],
      [3, 4],
      [2, 3],
      [1, 2],
      [1, 3],
      [1, 4],
    ]);
  });
  Deno.test("combinations 2", () => {
    assertArrayIncludes(combine(1, 1), [[1]]);
  });
  Deno.test("combinations 3", () => {
    assertArrayIncludes(combine(2, 1), [[1], [2]]);
  });
  Deno.test("combinations 4", () => {
    assertArrayIncludes(combine(3, 1), [[1], [2], [3]]);
  });
  Deno.test("combinations 5", () => {
    assertArrayIncludes(combine(4, 1), [[1], [2], [3], [4]]);
  });
  Deno.test("combinations 6", () => {
    assertArrayIncludes(combine(5, 1), [[1], [2], [3], [4], [5]]);
  });
  Deno.test("combinations 7", () => {
    assertArrayIncludes(combine(6, 1), [[1], [2], [3], [4], [5], [6]]);
  });
  Deno.test("combinations 8", () => {
    assertArrayIncludes(combine(5, 3), [
      [1, 2, 3],
      [1, 2, 4],
      [1, 2, 5],
      [1, 3, 4],
      [1, 3, 5],
      [1, 4, 5],
      [2, 3, 4],
      [2, 3, 5],
      [2, 4, 5],
      [3, 4, 5],
    ]);
  });
}

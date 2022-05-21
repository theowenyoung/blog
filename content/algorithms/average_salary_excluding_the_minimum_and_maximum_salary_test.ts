/**
 * <https://leetcode.com/problems/average-salary-excluding-the-minimum-and-maximum-salary/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function average(salary: number[]): number {
  let min = Number.MAX_VALUE;
  let max = 0;
  let sum = 0;
  for (const n of salary) {
    if (n < min) {
      min = n;
    }
    if (n > max) {
      max = n;
    }

    sum += n;
  }

  return (sum - min - max) / (salary.length - 2);
}

Deno.test("Average Salary Excluding the Minimum and Maximum Salary 1", () => {
  assertEquals(average([4000, 3000, 1000, 2000]), 2500);
});

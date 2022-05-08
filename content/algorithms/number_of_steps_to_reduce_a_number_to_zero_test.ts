/**
 * <https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function numberOfSteps(num: number): number {
  let steps = 0;
  let current = num;
  while (current > 0) {
    if (current % 2 === 0) {
      current = current / 2;
    } else {
      current = current - 1;
    }
    steps++;
  }
  return steps;
}

Deno.test("Number of Steps 1", () => {
  const num = 14;
  assertEquals(numberOfSteps(num), 6);
});
Deno.test("Number of Steps 2", () => {
  const num = 8;
  assertEquals(numberOfSteps(num), 4);
});

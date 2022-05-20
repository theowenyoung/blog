/**
 * <https://leetcode.com/problems/number-of-1-bits/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function hammingWeight(n: number): number {
  let count = 0;
  while (n !== 0) {
    count++;
    n = n & (n - 1); // remove 1
  }
  return count;
}

Deno.test("Number of 1 Bits", () => {
  assertEquals(hammingWeight(3), 2);
  assertEquals(hammingWeight(16), 1);
});

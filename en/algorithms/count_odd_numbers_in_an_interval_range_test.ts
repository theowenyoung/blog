/**
 * <https://leetcode.com/problems/count-odd-numbers-in-an-interval-range/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function countOdds(low: number, high: number): number {
  const count = Math.ceil((high - low) / 2);
  if (low % 2 === 1 && high % 2 === 1) {
    return count + 1;
  } else {
    return count;
  }
}
Deno.test("countOdds 1", () => {
  assertEquals(countOdds(3, 7), 3);
});

Deno.test("countOdds 2", () => {
  assertEquals(countOdds(8, 10), 1);
});

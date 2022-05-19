/**
 * <https://leetcode.com/problems/house-robber/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function rob(nums: number[]): number {
  let rob1 = 0,
    rob2 = 0;

  for (const n of nums) {
    const temp = Math.max(n + rob1, rob2);
    rob1 = rob2;
    rob2 = temp;
  }
  return rob2;
}
Deno.test("0198. House Robber 1", () => {
  assertEquals(rob([1, 2, 3, 1]), 4);
  assertEquals(rob([2, 7, 9, 3, 1]), 12);
});

Deno.test("0198. House Robber 2", () => {
  assertEquals(rob([2, 1, 1, 2]), 4);
});

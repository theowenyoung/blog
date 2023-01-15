/**
 * <https://leetcode.com/problems/single-number/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function singleNumber(nums: number[]): number {
  let xor = 0;
  for (let i = 0; i < nums.length; i++) {
    xor = xor ^ nums[i];
  }
  return xor;
}

Deno.test("Single Number", () => {
  assertEquals(singleNumber([2, 2, 1]), 1);
  // assertEquals(singleNumber([4, 1, 2, 1, 2]), 4);
});

/**
 * <https://leetcode.com/problems/reverse-bits/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function reverseBits(n: number): number {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = result * 2 + (n & 1);
    n >>= 1;
  }
  return result;
}

Deno.test("Reverse Bits", () => {
  assertEquals(reverseBits(43261596), 964176192);
  assertEquals(reverseBits(4294967293), 3221225471);
});

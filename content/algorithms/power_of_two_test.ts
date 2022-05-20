/**
 * <https://leetcode.com/problems/power-of-two/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function isPowerOfTwo1(n: number): boolean {
  let end = 31;
  let start = 0;
  // binary search
  while (end >= start) {
    const middle = Math.floor((end + start) / 2);
    const middlePower = Math.pow(2, middle);

    if (middlePower === n) {
      return true;
    } else if (middlePower > n) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }
  return false;
}
function isPowerOfTwo2(n: number): boolean {
  return Number.isInteger(Math.log2(n));
}
/**
 * bitwise
 * 8 & 7
 * 0100 & 0011 = 0000
 * 16 & 15
 * 1000 & 0111 = 0000
 * @param n
 * @returns
 */
function isPowerOfTwo3(n: number): boolean {
  return n > 0 && (n & -n) === n;
}
const solutions = [isPowerOfTwo1, isPowerOfTwo2, isPowerOfTwo3];
for (const isPowerOfTwo of solutions) {
  Deno.test("0231. Power of Two", () => {
    // assertEquals(isPowerOfTwo(1), true);
    assertEquals(isPowerOfTwo(16), true);
    // assertEquals(isPowerOfTwo(218), false);
  });
}

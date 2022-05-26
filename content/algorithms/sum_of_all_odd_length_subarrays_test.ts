/**
 * Sum of All Odd Length Subarrays
 * <https://leetcode.com/problems/sum-of-all-odd-length-subarrays/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function sumOddLengthSubarrays(arr: number[]): number {
  //        0,1,2,3,4
  // start: 5,4,3,2,1
  // end:   1,2,3,4,5
  // total: 5,8,9,8,6
  // odd:floor((t+1)/2): 3,4,5,4,3
  // even:ceil((t-1)/2): 2,4,4,4,3
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const start = i + 1;
    const end = arr.length - i;
    const total = start * end;
    const odd = Math.floor((total + 1) / 2);
    sum += odd * arr[i];
  }
  return sum;
}

Deno.test("Sum of All Odd Length Subarrays", () => {
  assertEquals(sumOddLengthSubarrays([1, 4, 2, 5, 3]), 58);
});

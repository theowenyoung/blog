/**
 * Maximum Product Subarray
 * <https://leetcode.com/problems/maximum-product-subarray/>
 *
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function maxProduct(nums: number[]): number {
  const maxProductDp: number[] = Array(nums.length).fill(1);
  const minProductDp: number[] = Array(nums.length).fill(1);
  maxProductDp[0] = nums[0];
  minProductDp[0] = nums[0];
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const val = nums[i];
    const currentMax = Math.max(
      val * maxProductDp[i - 1],
      val * minProductDp[i - 1],
      nums[i]
    );
    maxProductDp[i] = currentMax;
    const currentMin = Math.min(
      val * maxProductDp[i - 1],
      val * minProductDp[i - 1],
      nums[i]
    );

    minProductDp[i] = currentMin;

    max = Math.max(max, maxProductDp[i]);
  }
  return max;
}

Deno.test("maximum product subarray 1", () => {
  assertEquals(maxProduct([2, 3, -2, 4]), 6);
});

Deno.test("maximum product subarray 2", () => {
  assertEquals(maxProduct([-2, 3, -4]), 24);
});

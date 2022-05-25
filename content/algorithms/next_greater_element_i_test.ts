/**
 * <https://leetcode.com/problems/next-greater-element-i/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
  const result: number[] = [];
  const hash: Record<string, number> = {};
  const stack: number[] = [];
  for (let i = 0; i < nums2.length; i++) {
    const val = nums2[i];

    while (stack.length > 0 && val > stack[stack.length - 1]) {
      hash[stack.pop()!] = val;
    }

    stack.push(val);
  }
  for (let i = 0; i < nums1.length; i++) {
    result.push(hash[nums1[i]] ?? -1);
  }
  return result;
}

Deno.test("nextGreaterElement", () => {
  assertEquals(nextGreaterElement([4, 1, 2], [1, 3, 4, 2]), [-1, 3, -1]);
});

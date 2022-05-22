/**
 * <https://leetcode.com/problems/merge-sorted-array/>
 */
/**
 Do not return anything, modify nums1 in-place instead.
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function merge(
  nums1: number[],
  m: number,
  nums2: number[],
  n: number
): number[] {
  // from big to small
  let i = m - 1;
  let j = n - 1;
  let k = n + m - 1;
  while (i >= 0 && j >= 0) {
    if (nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }
  // if there are any rest j elements
  while (j >= 0) {
    nums1[j] = nums2[j];
    j--;
  }

  return nums1;
}

Deno.test("Merge Sorted Array", () => {
  const nums1 = [1, 2, 3, 0, 0, 0];
  const nums2 = [2, 5, 6];
  merge(nums1, 3, nums2, 3);
  assertEquals(nums1, [1, 2, 2, 3, 5, 6]);
});

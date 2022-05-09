/**
 * https://leetcode.com/problems/median-of-two-sorted-arrays/
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // sort the two arrays
  const sorted: number[] = [];
  let currentNums1Position = 0;
  let currentNums2Position = 0;
  while (
    currentNums1Position < nums1.length &&
    currentNums2Position < nums2.length
  ) {
    if (nums1[currentNums1Position] < nums2[currentNums2Position]) {
      sorted.push(nums1[currentNums1Position]);
      currentNums1Position++;
    } else {
      sorted.push(nums2[currentNums2Position]);
      currentNums2Position++;
    }
  }

  // add the remaining elements
  if (currentNums1Position < nums1.length) {
    sorted.push(...nums1.slice(currentNums1Position));
  }
  if (currentNums2Position < nums2.length) {
    sorted.push(...nums2.slice(currentNums2Position));
  }

  // get the median
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  return median;
}

Deno.test("find median sorted arrays test 1", () => {
  const nums1 = [1, 3];
  const nums2 = [2];
  const result = findMedianSortedArrays(nums1, nums2);
  const expected = 2.0;
  assertEquals(result, expected);
});
Deno.test("find median sorted arrays test 2", () => {
  const nums1 = [1, 2];
  const nums2 = [3, 4];
  const result = findMedianSortedArrays(nums1, nums2);
  const expected = 2.5;
  assertEquals(result, expected);
});

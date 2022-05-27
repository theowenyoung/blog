/**
 * Best Sightseeing Pair
 * <https://leetcode.com/problems/best-sightseeing-pair/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
// values[i]+i +values[j]-j
// 5,6,1,2,3
function maxScoreSightseeingPair(values: number[]): number {
  let max = values[0];
  let prevBestIndex = 0;
  for (let i = 1; i < values.length; i++) {
    max = Math.max(max, values[prevBestIndex] + prevBestIndex + values[i] - i);
    if (values[prevBestIndex] + prevBestIndex < values[i] + i) {
      prevBestIndex = i;
    }
  }
  return max;
}

Deno.test("Best Sightseeing Pair", () => {
  assertEquals(maxScoreSightseeingPair([8, 1, 5, 2, 6]), 11);
});

Deno.test("Best Sightseeing Pair2", () => {
  assertEquals(maxScoreSightseeingPair([5, 6, 1, 2, 7]), 10);
});

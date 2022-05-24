/**
 * <https://leetcode.com/problems/jump-game-ii/>
 */
import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function jump(nums: number[]): number {
  if (nums.length <= 1) {
    return 0;
  }
  let l = 0;
  let r = nums[0];
  let steps = 1;
  while (r < nums.length - 1) {
    let fartestIndex = l;
    let fartestNext = l;
    for (let i = l + 1; i <= r; i++) {
      if (nums[i] + i > fartestNext) {
        fartestNext = nums[i] + i;
        fartestIndex = i;
      }
    }
    l = fartestIndex;
    r = l + nums[l];
    steps++;
  }

  return steps;
}

Deno.test("jump game 1", () => {
  assertEquals(jump([2, 3, 1, 1, 4]), 2);
});
Deno.test("jump game 2", () => {
  assertEquals(jump([2, 3, 0, 1, 4]), 2);
});

Deno.test("jump game 3", () => {
  assertEquals(jump([1, 2, 3]), 2);
});
Deno.test("jump game 4", () => {
  assertEquals(jump([1, 1, 1, 1]), 3);
});

Deno.test("jump game 5", () => {
  assertEquals(jump([1, 2, 1, 1, 1]), 3);
});

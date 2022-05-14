/**
 * <https://leetcode.com/problems/flood-fill/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function flood(
  image: number[][],
  sr: number,
  sc: number,
  originalColor: number,
  newColor: number
) {
  // spread
  if (
    image[sr] !== undefined &&
    image[sr][sc] !== undefined &&
    sr >= 0 &&
    sc >= 0 &&
    sr < image.length &&
    sc < image[0]?.length
  ) {
    const currentColor = image[sr][sc];
    if (currentColor === originalColor && currentColor !== newColor) {
      // change
      image[sr][sc] = newColor;
      flood(image, sr, sc - 1, originalColor, newColor);
      flood(image, sr, sc + 1, originalColor, newColor);
      flood(image, sr - 1, sc, originalColor, newColor);
      flood(image, sr + 1, sc, originalColor, newColor);
    }
  }
}
function floodFill(
  image: number[][],
  sr: number,
  sc: number,
  newColor: number
): number[][] {
  flood(image, sr, sc, image[sr][sc], newColor);
  return image;
}
Deno.test("floodFill", () => {
  assertEquals(
    floodFill(
      [
        [1, 1, 1],
        [1, 1, 0],
        [1, 0, 1],
      ],
      1,
      1,
      2
    ),
    [
      [2, 2, 2],
      [2, 2, 0],
      [2, 0, 1],
    ]
  );
});

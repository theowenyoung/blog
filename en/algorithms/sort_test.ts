import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
import { bubbleSort } from "./bubble_sort.ts";
import { insertionSort } from "./insertion_sort.ts";
import { mergeSort } from "./merge_sort.ts";
import { quickSort } from "./quick_sort.ts";
import { selectionSort } from "./selection_sort.ts";
const inputArray = [
  9, 7, 8, 6, 5, 4, 99, 6, 3, 2, 1, 6, 9, 7, 8, 6, 5, 4, 99, 6, 3, 2, 1, 6, 9,
  7, 8, 6, 5, 4, 99, 6, 3, 2, 1, 6, 9, 7, 8, 6, 5, 4, 99, 6, 3, 2, 1, 6,
];
const expectArray = [
  1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6,
  6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 99, 99, 99, 99,
];
Deno.test("bubble sort", () => {
  const result = bubbleSort(inputArray);

  assertEquals(result, expectArray);
});
Deno.test("insertion sort", () => {
  const result = insertionSort(inputArray);
  assertEquals(result, expectArray);
});
Deno.test("merge sort", () => {
  const result = mergeSort(inputArray);
  assertEquals(result, expectArray);
});
Deno.test("quick sort", () => {
  const result = quickSort(inputArray);

  assertEquals(result, expectArray);
});
Deno.test("selection sort", () => {
  const result = selectionSort(inputArray);
  assertEquals(result, expectArray);
});

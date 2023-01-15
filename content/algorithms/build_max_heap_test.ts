import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

function swap(arr: number[], a: number, b: number) {
  const temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
function heapify(arr: number[], i: number) {
  const parentNode = arr[i];
  const leftChildIndex = i * 2 + 1;
  const rightChildIndex = i * 2 + 2;
  const leftChild = arr[leftChildIndex];
  const rightChild = arr[rightChildIndex];
  console.log("heapify index ", i);

  if (leftChild === undefined && rightChild === undefined) {
    console.log("no need to change cause no leaf");

    return;
  }

  let maxIndex = i;
  let maxValue = parentNode;
  if (leftChild > maxValue) {
    maxIndex = leftChildIndex;
    maxValue = leftChild;
  }
  if (rightChild > maxValue) {
    maxIndex = rightChildIndex;
    maxValue = rightChild;
  }

  if (maxIndex !== i) {
    // swap
    swap(arr, maxIndex, i);

    printHeap(arr);

    // contineu to heapify
    heapify(arr, maxIndex);
  } else {
    console.log("no need to change");
  }
}

function buildHeap(arr: number[]): number[] {
  const lastNodeWithLeaf = arr.length / 2 - 1;

  for (let i = lastNodeWithLeaf; i >= 0; i--) {
    heapify(arr, i);
  }

  return arr;
}

function printHeap(heap: number[]): void {
  const n = heap.length;
  let result = "";
  const lineNumbers = Math.ceil(Math.log2(n)) - 1;
  console.log("");

  for (let i = 0; i <= lineNumbers; i++) {
    const lineStartIndex = Math.pow(2, i) - 1;
    const lineEndIndex = Math.pow(2, i + 1) - 1 - 1;
    for (let j = lineStartIndex; j <= lineEndIndex; j++) {
      result = result + ((heap[j] || "-") + " ");
    }
    result = result + "\n";
  }
  console.log(result);
}

Deno.test("build heap", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  printHeap(arr);
  const result = buildHeap(arr);
  printHeap(result);

  assertEquals(result, [10, 9, 7, 8, 5, 6, 3, 1, 4, 2]);
});

/**
 * <https://leetcode.com/problems/merge-two-sorted-lists/>
 */

import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";

class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}
function arrayToListNode(arr: number[]): ListNode | null {
  let head: ListNode | null = null;
  let current: ListNode | null = null;
  for (let i = 0; i < arr.length; i++) {
    const node = new ListNode(arr[i]);
    if (head === null) {
      head = node;
    }
    if (current !== null) {
      current.next = node;
    }
    current = node;
  }
  return head;
}
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  let leftNode = list1;
  let rightNode = list2;
  const newNode = new ListNode(0, null);
  let currentNode = newNode;
  while (leftNode && rightNode) {
    if (leftNode.val < rightNode.val) {
      currentNode.next = new ListNode(leftNode.val);
      leftNode = leftNode.next;
    } else {
      currentNode.next = new ListNode(rightNode.val);
      rightNode = rightNode.next;
    }
    currentNode = currentNode.next;
  }
  if (leftNode) {
    currentNode.next = leftNode;
  } else {
    currentNode.next = rightNode;
  }
  return newNode.next;
}

Deno.test("mergeTwoLists", () => {
  assertEquals(
    mergeTwoLists(arrayToListNode([1, 2, 4]), arrayToListNode([1, 3, 4])),
    arrayToListNode([1, 1, 2, 3, 4, 4])
  );
});

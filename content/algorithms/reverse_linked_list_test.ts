/**
 * <https://leetcode.com/problems/reverse-linked-list/>
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
function reverseList(head: ListNode | null): ListNode | null {
  let currentNode: ListNode | null = head;
  let prevNode: ListNode | null = null;
  while (currentNode) {
    const tempNext = currentNode.next;
    currentNode.next = prevNode;
    prevNode = currentNode;
    currentNode = tempNext;
  }
  return prevNode;
}

Deno.test("0206. Reverse Linked List", () => {
  assertEquals(
    reverseList(arrayToListNode([1, 2, 3, 4, 5])),
    arrayToListNode([5, 4, 3, 2, 1])
  );
});

/**
 * <https://leetcode.com/problems/middle-of-the-linked-list/>
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
function middleNode(head: ListNode | null): ListNode | null {
  let currentSlowNode = head;
  let currentFastNode = head;
  while (currentSlowNode && currentFastNode?.next && currentFastNode) {
    currentFastNode = currentFastNode.next.next;
    currentSlowNode = currentSlowNode.next;
  }
  return currentSlowNode;
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
Deno.test("middleNode 1", () => {
  const head = arrayToListNode([1, 2, 3, 4, 5, 6]);
  const middle = middleNode(head) as ListNode;
  assertEquals(middle.val, 4);
});

Deno.test("middleNode 2", () => {
  const head = arrayToListNode([1, 2, 3, 4, 5]);
  const middle = middleNode(head) as ListNode;
  assertEquals(middle.val, 3);
});

/**
 * <https://leetcode.com/problems/palindrome-linked-list/>
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
function isPalindrome(head: ListNode | null): boolean {
  let currentSlowNode = head;
  let currentFastNode = head;

  // try to find the middle node, when fast node is end, slow node is middle node
  while (currentFastNode?.next && currentSlowNode?.next) {
    currentSlowNode = currentSlowNode.next;
    currentFastNode = currentFastNode.next.next;
  }

  // reverse the second half of the list, from middle node to end
  let currentReversedNodeEnd: ListNode | null = null;
  while (currentSlowNode) {
    const startNode = new ListNode(currentSlowNode.val);
    startNode.next = currentReversedNodeEnd;
    currentReversedNodeEnd = startNode;

    currentSlowNode = currentSlowNode.next;
  }

  // compare the first half and the second half
  let currentLeftNode = head;

  while (currentLeftNode && currentReversedNodeEnd) {
    if (currentLeftNode.val !== currentReversedNodeEnd.val) {
      return false;
    }
    currentLeftNode = currentLeftNode.next;
    currentReversedNodeEnd = currentReversedNodeEnd.next;
  }

  return true;
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

Deno.test("isPalindrome 1", () => {
  const l1 = arrayToListNode([1, 2, 3, 2, 1]);
  assertEquals(isPalindrome(l1), true);
});

Deno.test("isPalindrome 2", () => {
  const l1 = arrayToListNode([1, 2]);
  assertEquals(isPalindrome(l1), false);
});

Deno.test("isPalindrome 3", () => {
  const l1 = arrayToListNode([1]);
  assertEquals(isPalindrome(l1), true);
});

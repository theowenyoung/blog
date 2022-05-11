/**
 * <https://leetcode.com/problems/remove-nth-node-from-end-of-list/>
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
function removeNthFromEnd1(head: ListNode | null, n: number): ListNode | null {
  // first reverse the list node
  let currentNode = head;
  let newListNode: ListNode | null = null;
  while (currentNode) {
    const temp = currentNode.next;
    const startNode = currentNode;
    startNode.next = newListNode;
    newListNode = startNode;
    currentNode = temp;
  }

  if (n === 1) {
    newListNode = newListNode?.next || null;
  } else {
    // then remove the nth node
    let current = 0;
    let newCurrentNode = newListNode;
    while (newCurrentNode) {
      if (current === n - 1 - 1) {
        newCurrentNode.next = newCurrentNode?.next?.next || null;
        break;
      }
      current++;
      newCurrentNode = newCurrentNode.next;
    }
  }

  // reverse newListNode
  let currentNode3 = newListNode;
  let newReversedListNode: ListNode | null = null;
  while (currentNode3) {
    const temp = currentNode3.next;
    const startNode = currentNode3;
    startNode.next = newReversedListNode;
    newReversedListNode = startNode;
    currentNode3 = temp;
  }
  return newReversedListNode;
}

function removeNthFromEnd2(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let leftNode: ListNode | null = dummy;
  let rightNode: ListNode | null = head;
  while (n > 0 && rightNode) {
    rightNode = rightNode?.next || null;
    n--;
  }

  while (rightNode) {
    leftNode = leftNode?.next || null;
    rightNode = rightNode?.next;
  }

  // remove leftNode;
  if (leftNode?.next) {
    leftNode.next = leftNode?.next?.next || null;
  }
  return dummy.next;
}

const solutions = [removeNthFromEnd1, removeNthFromEnd2];
for (const removeNthFromEnd of solutions) {
  Deno.test("removeNthFromEnd 1", () => {
    const listNode = arrayToListNode([1, 2, 3, 4, 5]);
    const result = removeNthFromEnd(listNode, 2);
    assertEquals(result, arrayToListNode([1, 2, 3, 5]));
  });

  Deno.test("removeNthFromEnd 2", () => {
    const listNode = arrayToListNode([1]);
    const result = removeNthFromEnd(listNode, 1);
    assertEquals(result, arrayToListNode([]));
  });
}

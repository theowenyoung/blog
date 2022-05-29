/**
 *  Remove Duplicates from Sorted List
 * <https://leetcode.com/problems/remove-duplicates-from-sorted-list/>
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
function deleteDuplicates1(head: ListNode | null): ListNode | null {
  const hash: Record<number, boolean> = {};

  let slow = head;
  let fast = head?.next;
  if (slow) {
    hash[slow.val] = true;
  }
  while (slow && fast) {
    if (fast && !hash[fast.val]) {
      hash[fast.val] = true;
      slow = slow.next;
      fast = fast.next;
    } else {
      slow.next = fast.next;
      fast = fast.next;
    }
  }
  return head;
}

function deleteDuplicates2(head: ListNode | null): ListNode | null {
  let current = head;
  while (current) {
    if (current.next === null) {
      break;
    }
    if (current.next && current.next.val === current.val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }
  return head;
}

const solutions = [deleteDuplicates1, deleteDuplicates2];

for (const deleteDuplicates of solutions) {
  Deno.test("0203. Remove Duplicates from Sorted List", () => {
    assertEquals(
      deleteDuplicates(arrayToListNode([1, 1, 1, 2, 2, 3, 3, 3])),
      arrayToListNode([1, 2, 3])
    );
  });
}

/**
 * <https://leetcode.com/problems/merge-k-sorted-lists/>
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
function mergeKLists1(lists: Array<ListNode | null>): ListNode | null {
  const newList = new ListNode(0);
  const listPositions: (ListNode | null)[] = [];
  let currentNewList = newList;
  for (let i = 0; i < lists.length; i++) {
    listPositions[i] = lists[i];
  }
  let isEnd = false;
  while (!isEnd) {
    let min: number | undefined = undefined;
    let minAt: number | undefined = undefined;
    for (let j = 0; j < lists.length; j++) {
      if (min === undefined && listPositions[j]) {
        minAt = j;
        min = listPositions[j]!.val;
        continue;
      }

      if (
        min !== undefined &&
        listPositions[j] &&
        listPositions[j]!.val < min
      ) {
        min = listPositions[j]!.val;
        minAt = j;
      }
    }
    if (min !== undefined) {
      listPositions[minAt!] = listPositions[minAt!]!.next;
      currentNewList.next = new ListNode(min);
      currentNewList = currentNewList.next;
    } else {
      isEnd = true;
    }
  }

  // listPositions.pu
  return newList.next;
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
function mergeKLists2(lists: Array<ListNode | null>): ListNode | null {
  // split to 2
  if (lists.length === 1) {
    return lists[0];
  }
  let resultList = null;
  for (let i = 0; i < lists.length; i++) {
    resultList = mergeTwoLists(resultList, lists[i]);
  }
  return resultList;
}

function sortList(
  lists: Array<ListNode | null>,
  left: number,
  right: number
): ListNode | null {
  const middleIndex = left + Math.floor((right - left) / 2);
  if (left >= right) {
    return lists[left];
  }

  const list1 = sortList(lists, left, middleIndex);
  const list2 = sortList(lists, middleIndex + 1, right);
  return mergeTwoLists(list1, list2);
}

function mergeKLists3(lists: Array<ListNode | null>): ListNode | null {
  if (lists.length === 1) {
    return lists[0];
  }
  if (lists.length === 0) {
    return null;
  }
  return sortList(lists, 0, lists.length - 1);
}

const solutions = [mergeKLists1, mergeKLists2, mergeKLists3];

for (const mergeKLists of solutions) {
  Deno.test("mergeKLists", () => {
    assertEquals(
      mergeKLists([
        arrayToListNode([1, 4, 5]),
        arrayToListNode([1, 3, 4]),
        arrayToListNode([2, 6]),
      ]),
      arrayToListNode([1, 1, 2, 3, 4, 4, 5, 6])
    );
  });
}

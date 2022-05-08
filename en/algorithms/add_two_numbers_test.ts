import { assertEquals } from "https://deno.land/std@0.138.0/testing/asserts.ts";
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

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

function myAddTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const l1Numbers = [];
  if (l1 !== null) {
    l1Numbers.push(l1.val);
  }
  let l1Next = l1?.next;
  while (l1Next) {
    l1Numbers.push(l1Next.val);
    l1Next = l1Next.next;
  }
  const l2Numbers = [];
  if (l2 !== null) {
    l2Numbers.push(l2.val);
  }
  let l2Next = l2?.next;
  while (l2Next) {
    l2Numbers.push(l2Next.val);
    l2Next = l2Next.next;
  }

  // add two
  const resultNumbers: number[] = [];
  const maxLength = Math.max(l1Numbers.length, l2Numbers.length);
  for (let i = 0; i < maxLength; i++) {
    let sum = 0;

    let isHasValue = false;
    if (resultNumbers.length - i > 0) {
      if (resultNumbers[0] !== undefined) {
        isHasValue = true;
        sum = resultNumbers[0];
      }
    }

    if (l1Numbers.length) {
      sum += l1Numbers.shift() ?? 0;
    }
    if (l2Numbers.length) {
      sum += l2Numbers.shift() ?? 0;
    }

    if (sum > 9) {
      const sums = sum
        .toString()
        .split("")
        .map((item) => parseInt(item));
      if (isHasValue) {
        resultNumbers[0] = sums[1];
      } else {
        resultNumbers.unshift(sums[1]);
      }
      resultNumbers.unshift(sums[0]);
    } else {
      if (isHasValue) {
        resultNumbers[0] = sum;
      } else {
        resultNumbers.unshift(sum);
      }
    }
  }
  return arrayToListNode(resultNumbers.reverse());
}

function addTwoNumbers(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const head = new ListNode(0);
  let current = head;
  let carry = 0;
  while (l1 || l2) {
    const sum = carry + (l1?.val ?? 0) + (l2?.val ?? 0);
    carry = Math.floor(sum / 10);
    current.next = new ListNode(sum % 10);
    current = current.next;
    l1 = l1?.next || null;
    l2 = l2?.next || null;
  }
  if (carry) {
    current.next = new ListNode(carry);
  }
  return head.next;
}

const solutions = [myAddTwoNumbers, addTwoNumbers];

for (const solution of solutions) {
  Deno.test(solution.name + " add two numbers test 1", () => {
    const l1 = new ListNode(2, new ListNode(4, new ListNode(3)));
    const l2 = new ListNode(5, new ListNode(6, new ListNode(4)));
    const result = solution(l1, l2);
    const expected = new ListNode(7, new ListNode(0, new ListNode(8)));
    assertEquals(result, expected);
  });
  /*
  Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
  Output: [8,9,9,9,0,0,0,1]
  */
  Deno.test(solution.name + " add two numbers test 2", () => {
    const l1 = new ListNode(
      9,
      new ListNode(
        9,
        new ListNode(
          9,
          new ListNode(9, new ListNode(9, new ListNode(9, new ListNode(9))))
        )
      )
    );
    const l2 = new ListNode(
      9,
      new ListNode(9, new ListNode(9, new ListNode(9)))
    );
    const result = solution(l1, l2);
    const expected = new ListNode(
      8,
      new ListNode(
        9,
        new ListNode(
          9,
          new ListNode(
            9,
            new ListNode(0, new ListNode(0, new ListNode(0, new ListNode(1))))
          )
        )
      )
    );
    assertEquals(result, expected);
  });

  Deno.test(solution.name + " add two numbers test 3", () => {
    const l1 = [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1,
    ];
    const l2 = [5, 6, 4];
    const l1Node = arrayToListNode(l1);
    const l2Node = arrayToListNode(l2);
    const result = solution(l1Node, l2Node);
    const expected = [
      6, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1,
    ];
    const expectedNode = arrayToListNode(expected);
    assertEquals(result, expectedNode);
  });

  Deno.test(solution.name + " add two numbers test 4", () => {
    const l1 = [0];
    const l2 = [0];
    const l1Node = arrayToListNode(l1);
    const l2Node = arrayToListNode(l2);
    const result = solution(l1Node, l2Node);
    const expected = [0];
    const expectedNode = arrayToListNode(expected);
    assertEquals(result, expectedNode);
  });
}

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

export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}
export function arrayToListNode(arr: number[]): ListNode | null {
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

export function myAddTwoNumbers(
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

export function addTwoNumbers(
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

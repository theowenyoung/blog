function sumOddLengthSubarrays(arr: number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    // 1
    sum += arr[i];
    // 3

    sum += arr[i];

    // 5
  }
  return sum;
}

const a = sumOddLengthSubarrays([1, 4, 2, 5, 3]);
console.log("a", a);

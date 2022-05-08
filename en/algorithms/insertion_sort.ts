export const insertionSort = (arr: number[]): number[] => {
  const array = arr.slice();
  for (let i = 1; i < array.length; i++) {
    for (let j = i; j > 0; j--) {
      if (array[j] >= array[j - 1]) {
        break;
      } else {
        const temp = array[j - 1];
        array[j - 1] = array[j];
        array[j] = temp;
      }
    }
  }
  return array;
};
// best O(n)
// worst O(n^2)

/**
 * Find the smallest number each time and swap with the far leftmost number, so that the leftmost number is always the smallest.
 * @param arr
 * @returns
 */
export const selectionSort = (arr: number[]): number[] => {
  const array = arr.slice();
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    let isChanged = false;
    for (let j = i + 1; j < array.length; j++) {
      if (array[minIndex] > array[j]) {
        minIndex = j;
        isChanged = true;
      }
    }
    if (isChanged) {
      const temp = array[i];
      array[i] = array[minIndex];
      array[minIndex] = temp;
    }
  }
  return array;
};
// O(n^2)

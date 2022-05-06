export const bubbleSort = (arr: number[]): number[] => {
  const array = arr.slice();
  let isNeedSwap = false;
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - 1 - i; j++) {
      if (array[j] > array[j + 1]) {
        isNeedSwap = true;
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
    if (!isNeedSwap) {
      break;
    }
  }
  return array;
};

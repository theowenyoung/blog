const sortSortedGroups = (
  leftArray: number[],
  rightArray: number[]
): number[] => {
  let newArray = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
    if (leftArray[leftIndex] < rightArray[rightIndex]) {
      newArray.push(leftArray[leftIndex]);
      leftIndex++;
    } else {
      newArray.push(rightArray[rightIndex]);
      rightIndex++;
    }
  }
  if (leftIndex < leftArray.length) {
    newArray = newArray.concat(leftArray.slice(leftIndex));
  }
  if (rightIndex < rightArray.length) {
    newArray = newArray.concat(rightArray.slice(rightIndex));
  }

  return newArray;
};
export const mergeSort = (arr: number[]): number[] => {
  if (arr.length < 2) {
    return arr;
  }
  const middleIndex = Math.floor(arr.length / 2);
  const leftArray = arr.slice(0, middleIndex);
  const rightArray = arr.slice(middleIndex);
  return sortSortedGroups(mergeSort(leftArray), mergeSort(rightArray));
};

function isValidSudoku(board: string[][]): boolean {
  const rows = board.length;
  const cols = board[0].length;
  const total = rows * cols;

  const hash: Record<string, Set<string>> = {};
  for (let i = 0; i < total; i++) {
    const col = i % 9;
    const row = Math.floor(i / 9);
    const colKey = `col${col}`;
    const rowKey = `row${row}`;
    if (!hash[colKey]) {
      hash[colKey] = new Set();
    }
    if (!hash[rowKey]) {
      hash[rowKey] = new Set();
    }

    const subCol = Math.floor(col / 3);
    const subRow = Math.floor(row / 3);

    const key = `${subRow}-${subCol}`;
    if (!hash[key]) {
      hash[key] = new Set();
    }

    const val = board[row][col];

    if (val !== ".") {
      if (
        hash[colKey].has(val) ||
        hash[rowKey].has(val) ||
        hash[key].has(val)
      ) {
        return false;
      }
      hash[colKey].add(val);
      hash[rowKey].add(val);
      hash[key].add(val);
    }
  }
  return true;
}

const a = isValidSudoku([
  ["5", "3", ".", ".", "7", ".", ".", ".", "."],
  ["6", ".", ".", "1", "9", "5", ".", ".", "."],
  [".", "9", "8", ".", ".", ".", ".", "6", "."],
  ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
  ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
  ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
  [".", "6", ".", ".", ".", ".", "2", "8", "."],
  [".", ".", ".", "4", "1", "9", ".", ".", "5"],
  [".", ".", ".", ".", "8", ".", ".", "7", "9"],
]);
console.log("a", a);

function minPathSum(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const dp: number[][] = Array.from(Array(rows), () => Array(cols));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 0 && j === 0) {
        dp[i][j] = grid[i][j];
      } else {
        const top = i - 1;
        const left = j - 1;

        if (top >= 0 && left >= 0) {
          dp[i][j] = Math.min(dp[top][j], dp[i][left]) + grid[i][j];
        } else if (top >= 0) {
          dp[i][j] = dp[top][j] + grid[i][j];
        } else {
          dp[i][j] = dp[i][left] + grid[i][j];
        }
      }
    }
  }
  console.log("dp", dp);

  return dp[rows - 1][cols - 1];
}

const a = minPathSum([
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
]);
console.log("a", a);

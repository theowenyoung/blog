function uniquePaths(mat: number[][]): number {
  const m = mat.length;
  const n = mat[0].length;
  const dp: number[][] = Array.from(Array(m), () => Array(n));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (mat[i][j] === 1) {
        dp[i][j] = 0;
      } else if (i === 0 && j === 0) {
        dp[i][j] = 1;
      } else if (
        (i === 0 && dp[0][j - 1] === 0) ||
        (j === 0 && dp[i - 1][0] === 0)
      ) {
        dp[i][j] = 0;
      } else if (
        (i === 0 && dp[0][j - 1] !== 0) ||
        (j === 0 && dp[i - 1][0] !== 0)
      ) {
        dp[i][j] = 1;
      } else {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      }
    }
  }

  return dp[m - 1][n - 1];
}

const a = uniquePaths([[1, 0]]);
console.log("a", a);

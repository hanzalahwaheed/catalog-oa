const fs = require("fs");
const Decimal = require("decimal.js");

// test_case1
fs.readFile("test_case1.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const testCase = JSON.parse(data);

  // Decode Y values (with base specified)
  const points = Object.entries(testCase)
    .filter(([key]) => !isNaN(key))
    .map(([x, point]) => [
      new Decimal(x),
      new Decimal(parseInt(point.value, point.base).toString()),
    ]);

  // Find secret 'c' using different methods
  const cLagrange = lagrangeInterpolation(points, testCase.keys.k).toString();
  const cMatrix = matrixMethod(points, testCase.keys.k).toString();
  const cGauss = gaussElimination(points, testCase.keys.k).toString();

  console.log("test_case1");
  console.log("c (Lagrange) =", cLagrange);
  console.log("c (Matrix) =", cMatrix);
  console.log("c (Gauss Elimination) =", cGauss);
});

// test_case2
fs.readFile("test_case2.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const testCase = JSON.parse(data);

  // Decode Y values (with base specified)
  const points = Object.entries(testCase)
    .filter(([key]) => !isNaN(key))
    .map(([x, point]) => [
      new Decimal(x),
      new Decimal(parseInt(point.value, point.base).toString()),
    ]);

  // Find secret 'c' using different methods
  const cLagrange = lagrangeInterpolation(points, testCase.keys.k)
    .round()
    .toString();
  const cMatrix = matrixMethod(points, testCase.keys.k).round().toString();
  const cGauss = gaussElimination(points, testCase.keys.k).round().toString();

  console.log("test_case2");
  console.log("c (Lagrange) =", cLagrange);
  console.log("c (Matrix) =", cMatrix);
  console.log("c (Gauss Elimination) =", cGauss);
});

// Lagrange interpolation
function lagrangeInterpolation(points, k) {
  let result = new Decimal(0);

  for (let i = 0; i < k; i++) {
    let term = new Decimal(points[i][1]);
    for (let j = 0; j < k; j++) {
      if (j !== i) {
        term = term
          .times(new Decimal(0).minus(points[j][0]))
          .dividedBy(new Decimal(points[i][0]).minus(points[j][0]));
      }
    }
    result = result.plus(term);
  }

  return result;
}

// Matrix method (Simple Gaussian elimination-based solver)
function matrixMethod(points, k) {
  const m = k - 1;
  const A = [];
  const b = [];

  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = m; j >= 0; j--) {
      row.push(points[i][0].toPower(j));
    }
    A.push(row);
    b.push(points[i][1]);
  }

  // Augmented matrix
  const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  // Gaussian elimination (adapted to use Decimal)
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < k; j++) {
      const factor = augmentedMatrix[j][i].dividedBy(augmentedMatrix[i][i]);
      for (let k = i; k <= m + 1; k++) {
        augmentedMatrix[j][k] = augmentedMatrix[j][k].minus(
          factor.times(augmentedMatrix[i][k])
        );
      }
    }
  }

  // Back substitution (adapted to use Decimal)
  const x = new Array(m + 1).fill(new Decimal(0));
  for (let i = m; i >= 0; i--) {
    x[i] = augmentedMatrix[i][m + 1];
    for (let j = i + 1; j <= m; j++) {
      x[i] = x[i].minus(augmentedMatrix[i][j].times(x[j]));
    }
    x[i] = x[i].dividedBy(augmentedMatrix[i][i]);
  }

  return x[m];
}

// Gauss elimination
function gaussElimination(points, k) {
  const m = k - 1;
  const A = [];
  const b = [];

  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = m; j >= 0; j--) {
      row.push(points[i][0].toPower(j));
    }
    A.push(row);
    b.push(points[i][1]);
  }

  // Augmented matrix
  const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < k; j++) {
      const factor = augmentedMatrix[j][i].dividedBy(augmentedMatrix[i][i]);
      for (let k = i; k <= m + 1; k++) {
        augmentedMatrix[j][k] = augmentedMatrix[j][k].minus(
          factor.times(augmentedMatrix[i][k])
        );
      }
    }
  }

  // Back substitution
  const x = new Array(m + 1).fill(new Decimal(0));
  for (let i = m; i >= 0; i--) {
    x[i] = augmentedMatrix[i][m + 1];
    for (let j = i + 1; j <= m; j++) {
      x[i] = x[i].minus(augmentedMatrix[i][j].times(x[j]));
    }
    x[i] = x[i].dividedBy(augmentedMatrix[i][i]);
  }

  return x[m];
}

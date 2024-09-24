const fs = require("fs");

// Read test case from JSON
fs.readFile("test_case.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const testCase = JSON.parse(data);

  // Decode Y values
  const points = Object.entries(testCase)
    .filter(([key]) => !isNaN(key))
    .map(([x, point]) => [
      parseInt(x),
      parseInt(point.value, parseInt(point.base)),
    ]);

  // Find secret 'c'
  const c = lagrangeInterpolation(points, testCase.keys.k);
  const cc = gaussElimination(points, testCase.keys.k);
  const ccc = matrixMethod(points, testCase.keys.k);

  console.log("c (lagrange_method)=", c);
  console.log("c (gauss_elim)", cc);
  console.log("c (matrix_method)", ccc);
});

// Lagrange interpolation
function lagrangeInterpolation(points, k) {
  let result = 0;

  for (let i = 0; i < k; i++) {
    let term = points[i][1]; // y-value

    for (let j = 0; j < k; j++) {
      if (j !== i) {
        term *= (0 - points[j][0]) / (points[i][0] - points[j][0]); // Lagrange basis polynomial
      }
    }

    result += term;
  }

  return result;
}

// Gauss elimination
function gaussElimination(points, k) {
  const m = k - 1; // Degree of the polynomial
  const A = [];
  const b = [];

  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = m; j >= 0; j--) {
      row.push(Math.pow(points[i][0], j));
    }
    A.push(row);
    b.push(points[i][1]);
  }

  // Augmented matrix
  const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let i = 0; i < m; i++) {
    // Pivot selection (partial pivoting - optional)
    // ...

    // Elimination
    for (let j = i + 1; j < k; j++) {
      const factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];
      for (let k = i; k <= m + 1; k++) {
        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
      }
    }
  }

  // Back substitution
  const x = new Array(m + 1).fill(0);
  for (let i = m; i >= 0; i--) {
    x[i] = augmentedMatrix[i][m + 1];
    for (let j = i + 1; j <= m; j++) {
      x[i] -= augmentedMatrix[i][j] * x[j];
    }
    x[i] /= augmentedMatrix[i][i];
  }

  return x[m]; // The constant term 'c'
}

// Matrix method (using a simple Gaussian elimination-based solver)
function matrixMethod(points, k) {
  const m = k - 1;
  const A = [];
  const b = [];

  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = m; j >= 0; j--) {
      row.push(Math.pow(points[i][0], j));
    }
    A.push(row);
    b.push(points[i][1]);
  }

  // Augmented matrix
  const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  // Gaussian elimination (same as in gaussElimination function)
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < k; j++) {
      const factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];
      for (let k = i; k <= m + 1; k++) {
        augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
      }
    }
  }

  // Back substitution
  const x = new Array(m + 1).fill(0);
  for (let i = m; i >= 0; i--) {
    x[i] = augmentedMatrix[i][m + 1];
    for (let j = i + 1; j <= m; j++) {
      x[i] -= augmentedMatrix[i][j] * x[j];
    }
    x[i] /= augmentedMatrix[i][i];
  }

  return x[m];
}

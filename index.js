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

  console.log("c =", c);
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

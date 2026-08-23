/**
 * Safely evaluates mathematical expressions like "23-8-4", "100+25*4", "500/2", "12.5*2".
 * Returns the numeric result rounded to 2 decimal places, or null if invalid / incomplete.
 */
export const evaluateMathExpression = (expr) => {
  if (expr === null || expr === undefined) return null;
  const str = String(expr).trim();
  if (!str) return null;

  // Clean characters: replace custom multiplication/division symbols and commas
  let clean = str
    .replace(/[xX×]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/,/g, "")
    .trim();

  // Validate allowed characters (digits, operators +, -, *, /, parenthesis, spaces, dot)
  if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(clean)) {
    return null;
  }

  // Remove trailing dangling operators like "23+" or "500 - "
  clean = clean.replace(/[\+\-\*\/]+$/, "").trim();
  if (!clean) return null;

  try {
    // Evaluation in strict mode with Function
    const res = new Function(`'use strict'; return (${clean})`)();
    if (typeof res === "number" && !isNaN(res) && isFinite(res)) {
      return Math.round((res + Number.EPSILON) * 100) / 100;
    }
    return null;
  } catch (err) {
    return null;
  }
};

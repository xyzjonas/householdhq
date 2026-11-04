/**
 * Tape-style calculator behind the amount keypad. The "tape" is the raw
 * formula string (e.g. "1200+250"); amounts are never negative so a leading
 * minus is rejected.
 */

export type Key =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "="
  | "back"
  | "clear";

const MAX_LENGTH = 14;
const MAX_DECIMALS = 2;

const isOperator = (c: string | undefined) => c === "+" || c === "-";

/** The number currently being typed (everything after the last operator). */
function lastNumber(tape: string): string {
  return tape.split(/[+-]/).at(-1) ?? "";
}

/** Evaluates the tape. A dangling trailing operator is ignored. */
export function evaluate(tape: string): number {
  const clean = isOperator(tape.at(-1)) ? tape.slice(0, -1) : tape;
  const terms = clean.match(/[+-]?[^+-]+/g) ?? [];
  const sum = terms.reduce((acc, term) => acc + (Number(term) || 0), 0);
  return Math.round(sum * 100) / 100;
}

export function hasOperator(tape: string): boolean {
  return /[+-]/.test(tape);
}

export function press(tape: string, key: Key): string {
  switch (key) {
    case "clear":
      return "";
    case "back":
      return tape.slice(0, -1);
    case "=": {
      if (!hasOperator(tape)) return tape;
      const result = evaluate(tape);
      return result > 0 ? String(result) : "";
    }
    case "+":
    case "-":
      if (tape === "") return tape;
      if (isOperator(tape.at(-1))) return tape.slice(0, -1) + key;
      return tape.length < MAX_LENGTH ? tape + key : tape;
    case ".": {
      const current = lastNumber(tape);
      if (current.includes(".") || tape.length >= MAX_LENGTH) return tape;
      return current === "" ? `${tape}0.` : `${tape}.`;
    }
    default: {
      if (tape.length >= MAX_LENGTH) return tape;
      const current = lastNumber(tape);
      const [, decimals] = current.split(".");
      if (decimals !== undefined && decimals.length >= MAX_DECIMALS) {
        return tape;
      }
      // Replace a lone leading zero instead of producing "05".
      if (current === "0") return tape.slice(0, -1) + key;
      return tape + key;
    }
  }
}

/** "1200+250" -> "1200 + 250" */
export function prettyTape(tape: string): string {
  return tape === "" ? "0" : tape.replace(/([+-])/g, " $1 ");
}

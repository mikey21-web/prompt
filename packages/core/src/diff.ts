/**
 * Tiny line-based diff (Myers-ish, simplified). Zero deps.
 *
 * Returns an array of segments tagged "same" / "added" / "removed". Good
 * enough to render a side-by-side or unified diff for prompt versions.
 * Not optimal for huge inputs — fine for prompts (a few KB max).
 */

export type DiffOp = "same" | "added" | "removed";
export interface DiffSegment {
  op: DiffOp;
  line: string;
}

export function diffLines(a: string, b: string): DiffSegment[] {
  const A = a.split(/\r?\n/);
  const B = b.split(/\r?\n/);
  const m = A.length;
  const n = B.length;

  // Build LCS table
  const lcs: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (A[i] === B[j]) lcs[i][j] = lcs[i + 1][j + 1] + 1;
      else lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  // Walk to produce segments
  const out: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      out.push({ op: "same", line: A[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ op: "removed", line: A[i] });
      i++;
    } else {
      out.push({ op: "added", line: B[j] });
      j++;
    }
  }
  while (i < m) out.push({ op: "removed", line: A[i++] });
  while (j < n) out.push({ op: "added", line: B[j++] });
  return out;
}

/**
 * Summarize a diff into added/removed counts. Useful for thread list previews.
 */
export function diffStats(segments: DiffSegment[]): {
  added: number;
  removed: number;
} {
  let added = 0;
  let removed = 0;
  for (const s of segments) {
    if (s.op === "added") added++;
    else if (s.op === "removed") removed++;
  }
  return { added, removed };
}

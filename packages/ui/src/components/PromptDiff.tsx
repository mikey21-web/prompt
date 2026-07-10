interface PromptDiffProps {
  original: string;
  optimized: string;
  tokensIn: number;
  tokensOut: number;
  savedTokens: number;
}

export function PromptDiff({
  original,
  optimized,
  tokensIn,
  tokensOut,
  savedTokens,
}: PromptDiffProps) {
  const pctSaved = tokensIn > 0 ? Math.round((savedTokens / tokensIn) * 100) : 0;
  const expanded = tokensOut > tokensIn;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2 text-xs text-center font-medium">
        <div
          className="flex-1 rounded-lg px-2.5 py-1.5"
          style={{
            backgroundColor: 'var(--red-dim)',
            color: 'var(--red)',
          }}
        >
          Before: ~{tokensIn}
        </div>
        <div
          className="flex-1 rounded-lg px-2.5 py-1.5"
          style={{
            backgroundColor: 'var(--green-dim)',
            color: 'var(--green)',
          }}
        >
          After: ~{tokensOut}{" "}
          {expanded
            ? `(+${Math.round(((tokensOut - tokensIn) / tokensIn) * 100)}%)`
            : `(-${pctSaved}%)`}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Original</p>
          <div
            className="border rounded-lg p-2.5 text-xs overflow-auto whitespace-pre-wrap max-h-32"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            {original}
          </div>
        </div>
        <div>
          <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Optimized</p>
          <div
            className="border rounded-lg p-2.5 text-xs overflow-auto whitespace-pre-wrap max-h-32"
            style={{
              borderColor: 'rgba(74,222,128,0.2)',
              backgroundColor: 'var(--green-dim)',
              color: 'var(--text-primary)',
            }}
          >
            {optimized}
          </div>
        </div>
      </div>
    </div>
  );
}

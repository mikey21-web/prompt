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
    <div className="space-y-3">
      <div className="flex gap-3 text-sm font-medium text-center">
        <div className="flex-1 bg-red-50 text-red-700 rounded px-3 py-1">
          Before: ~{tokensIn} tokens
        </div>
        <div className="flex-1 bg-green-50 text-green-700 rounded px-3 py-1">
          After: ~{tokensOut} tokens{" "}
          {expanded ? `(+${Math.round(((tokensOut - tokensIn) / tokensIn) * 100)}%)` : `(-${pctSaved}%)`}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Original</p>
          <div className="bg-gray-50 border rounded p-3 text-sm text-gray-600 max-h-40 overflow-auto whitespace-pre-wrap">
            {original}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Optimized</p>
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-gray-800 max-h-40 overflow-auto whitespace-pre-wrap">
            {optimized}
          </div>
        </div>
      </div>
    </div>
  );
}

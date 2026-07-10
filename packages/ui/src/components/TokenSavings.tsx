interface TokenSavingsProps {
  tokens: number;
  estimatedCost?: number;
  className?: string;
}

export function TokenSavings({
  tokens,
  estimatedCost,
  className,
}: TokenSavingsProps) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <div className="text-2xl font-bold" style={{ color: 'var(--green)' }}>
        {tokens.toLocaleString()}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Tokens saved
      </div>
      {estimatedCost !== undefined && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          ≈ ${estimatedCost.toFixed(3)} saved
        </div>
      )}
    </div>
  );
}

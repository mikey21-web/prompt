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
      <div className="text-3xl font-bold text-green-600">
        {tokens.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 mt-1">Tokens saved</div>
      {estimatedCost !== undefined && (
        <div className="text-xs text-gray-400 mt-1">
          ≈ ${estimatedCost.toFixed(3)} saved
        </div>
      )}
    </div>
  );
}

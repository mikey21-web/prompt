// Improved token counting using common tokenization patterns
// Roughly 1 token ≈ 4 chars for English, but varies by language and content

const TOKEN_RATIOS: Record<string, number> = {
  compress: 3.5,   // compress mode - shorter output, more efficient
  enhance: 4.5,    // enhance mode - longer output, more verbose
  rewrite: 4,      // rewrite mode - similar to input
  tone: 4,         // tone mode - similar to input
  qa: 4.5,         // qa mode - longer with questions
  template: 4,     // template mode - similar to input
};

export function countTokens(text: string, mode?: string): number {
  if (!text) return 0;
  
  // Count words (more accurate than chars for English)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  
  // Special character penalty (code, JSON, etc. tokenize differently)
  const specialCharRatio = (text.match(/[{}[\]<>()|&;=+/\\"']/g)?.length || 0) / Math.max(charCount, 1);
  const isCodeLike = specialCharRatio > 0.05;
  
  // For code-like content, tokens are closer to 1:1 with words
  // For prose, tokens are closer to 1.3:1 with words
  const tokensFromWords = isCodeLike ? wordCount * 1.1 : wordCount * 1.3;
  
  // Fallback to char-based for very short text
  const tokensFromChars = charCount / (TOKEN_RATIOS[mode || "rewrite"] || 4);
  
  // Use the higher estimate for safety (better to slightly overcount)
  return Math.max(Math.ceil(tokensFromWords), Math.ceil(tokensFromChars));
}

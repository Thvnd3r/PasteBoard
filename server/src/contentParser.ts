// Function to detect if content is a URL, code snippet, or plain text
export const detectContentType = (content: string): 'link' | 'code' | 'text' => {
  // Regular expression for URL detection
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  // Check if content matches URL pattern
  if (urlPattern.test(content.trim())) {
    return 'link';
  }
  
  // Check if content is a code snippet
  // Look for code blocks with backticks or common code patterns
  const codePatterns = [
    /```[\s\S]*?```/, // Markdown code blocks
    /`[^`]+`/, // Inline code
    /\b(function|class|if|for|while|import|export|const|let|var|def|public|private)\b/, // Common keywords
    /[{}();]/, // Common code punctuation
    /\b\d+\s*[+\-*/%=]\s*\d+\b/ // Simple math expressions
  ];
  
  // If content has multiple lines and matches code patterns, consider it code
  if (content.includes('\n') && codePatterns.some(pattern => pattern.test(content))) {
    return 'code';
  }
  
  // For shorter content, be more selective about code detection
  if (content.length > 20 && codePatterns.some(pattern => pattern.test(content))) {
    return 'code';
  }
  
  // Default to text
  return 'text';
};

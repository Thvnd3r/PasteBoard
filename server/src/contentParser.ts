// Import highlight.js for language detection
import hljs from 'highlight.js';

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
    /\b(function|class|if|for|while|import|export|const|let|var|def|public|private|interface|type)\b/, // Common keywords including TypeScript keywords
    /[{}();]/, // Common code punctuation
    /\b\d+\s*[+\-*/%=]\s*\d+\b/, // Simple math expressions
    /\b(socket|setContent|on|=>)\b/ // TypeScript/JavaScript specific patterns
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

// Function to detect programming language of code snippet
export const detectLanguage = (content: string): string => {
  // Remove markdown code block markers if present
  let codeContent = content;
  const codeBlockMatch = content.match(/```(\w*)\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    // If language is specified in the code block, use it
    if (codeBlockMatch[1]) {
      // Normalize some language names
      const lang = codeBlockMatch[1].toLowerCase();
      if (lang === 'ts' || lang === 'tsx') return 'typescript';
      if (lang === 'js' || lang === 'jsx') return 'javascript';
      return lang;
    }
    codeContent = codeBlockMatch[2];
  }
  
  try {
    // Use highlight.js to auto-detect language
    const result = hljs.highlightAuto(codeContent, ['javascript', 'typescript', 'python', 'java', 'cpp', 'css', 'html']);
    return result.language || 'plaintext';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'plaintext';
  }
};

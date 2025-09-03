// Function to detect if content is a URL or plain text
export const detectContentType = (content: string): 'link' | 'text' => {
  // Regular expression for URL detection
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  // Check if content matches URL pattern
  if (urlPattern.test(content.trim())) {
    return 'link';
  }
  
  // Default to text
  return 'text';
};

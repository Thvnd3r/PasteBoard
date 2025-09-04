import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';

// Register commonly used languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);

interface ContentItem {
  id: number;
  type: string;
  content: string;
  filename?: string;
  tag?: string;
  language?: string;
  timestamp?: string;
}

// Helper function to truncate content to a maximum number of lines
const truncateContent = (content: string, maxLines: number = 10): string => {
  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return content;
  }
  return lines.slice(0, maxLines).join('\n') + '\n...';
};

// Helper function to generate a title from content
const generateTitle = (item: ContentItem): string => {
  if (item.type === 'link') {
    try {
      const url = new URL(item.content);
      return url.hostname;
    } catch {
      // If URL parsing fails, fall back to truncating the content
      return item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content;
    }
  } else if (item.type === 'file') {
    return item.content || 'File';
  } else if (item.type === 'code') {
    // For code, use the first line or a generic title
    const firstLine = item.content.split('\n')[0];
    return firstLine.length > 0 ? firstLine : 'Code snippet';
 } else {
    // For text, truncate to 50 characters
    return item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content;
  }
};

interface ContentDisplayProps {
  content: ContentItem[];
  onDeleteItem?: (id: number) => void;
  onDeleteAll?: () => void;
  showDeleteAll?: boolean;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
  content, 
  onDeleteItem,
  onDeleteAll,
  showDeleteAll = true
}) => {
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [showConfirmDeleteItem, setShowConfirmDeleteItem] = useState<number | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    // Highlight code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);
  
  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderContent = (item: ContentItem) => {
    const isExpanded = expandedItems[item.id] || false;
    // Apply truncation to all content types except files
    const shouldTruncate = item.type !== 'file' && item.content.split('\n').length > 10;
    
    if (item.type === 'link') {
      const displayContent = isExpanded || !shouldTruncate ? item.content : truncateContent(item.content);
      return (
        <>
          <a href={item.content} target="_blank" rel="noopener noreferrer">
            {displayContent}
          </a>
          {shouldTruncate && (
            <button 
              className="expand-collapse-button"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </>
      );
    } else if (item.type === 'file') {
      const fileUrl = `/uploads/${item.filename}`;
      return (
        <div>
          <span>File: {item.content}</span>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View File
          </a>
        </div>
      );
    } else if (item.type === 'code') {
      // For code snippets, we'll render them with syntax highlighting
      return (
        <>
          <pre className={`code-content ${isExpanded ? 'expanded' : ''}`}>
            <code className={item.language ? `language-${item.language}` : ''}>
              {item.content}
            </code>
          </pre>
          {shouldTruncate && (
            <button 
              className="expand-collapse-button"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </>
      );
    } else {
      // For text content
      return (
        <>
          <span className={`text-content ${isExpanded ? 'expanded' : ''}`}>{item.content}</span>
          {shouldTruncate && (
            <button 
              className="expand-collapse-button"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </>
      );
    }
  };
  
  const copyToClipboard = (text: string, itemId: number) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedItemId(itemId);
        setTimeout(() => setCopiedItemId(null), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleDeleteAll = () => {
    if (onDeleteAll) {
      onDeleteAll();
      setShowConfirmDeleteAll(false);
    }
  };
  
  const handleDeleteItem = (id: number) => {
    if (onDeleteItem) {
      onDeleteItem(id);
      setShowConfirmDeleteItem(null);
    }
  };
  
  return (
    <div className="content-display">
      <div className="content-header">
        <h2>Recent Content</h2>
        {showDeleteAll && (
          <div className="delete-all-container">
            {showConfirmDeleteAll ? (
              <div className="confirm-delete-all">
                <span>Are you sure? </span>
                <button className="confirm-button" onClick={handleDeleteAll}>Yes</button>
                <button className="cancel-button" onClick={() => setShowConfirmDeleteAll(false)}>No</button>
              </div>
            ) : (
              <button className="delete-all-button" onClick={() => setShowConfirmDeleteAll(true)}>
                Delete All
              </button>
            )}
          </div>
        )}
      </div>
      
      {content.length === 0 ? (
        <p>No content yet. Paste something!</p>
      ) : (
        <ul>
          {content.map((item) => (
            <li key={item.id} className={`content-item ${item.type}`}>
              {/* Standardized header with Tag - Title - Timestamp */}
              <div className="entry-header">
                <div className="entry-header-left">
                  {item.tag && <span className={`tag ${item.tag}`}>{item.tag}</span>}
                  <span className="entry-title">{generateTitle(item)}</span>
                  <span className="timestamp">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                <div className="entry-header-right">
                  {(item.type === 'text' || item.type === 'link' || item.type === 'code') && (
                    <button 
                      className="copy-button" 
                      onClick={() => copyToClipboard(item.content, item.id)}
                      aria-label="Copy to clipboard"
                    >
                      {copiedItemId === item.id ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                  {item.type === 'file' && (
                    <button 
                      className="download-button" 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/uploads/${item.filename}`;
                        link.download = item.content || 'download';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      aria-label="Download file"
                    >
                      Download
                    </button>
                  )}
                  {onDeleteItem && (
                    showConfirmDeleteItem === item.id ? (
                      <div className="confirm-delete-item">
                        <span>Delete? </span>
                        <button className="confirm-button" onClick={() => handleDeleteItem(item.id)}>Yes</button>
                        <button className="cancel-button" onClick={() => setShowConfirmDeleteItem(null)}>No</button>
                      </div>
                    ) : (
                      <button 
                        className="delete-button" 
                        onClick={() => setShowConfirmDeleteItem(item.id)}
                        aria-label="Delete item"
                      >
                        Delete
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="entry-content">
                {renderContent(item)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentDisplay;

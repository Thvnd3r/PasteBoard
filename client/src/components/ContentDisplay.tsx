import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css';

// Register commonly used languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);

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
  const [modalContent, setModalContent] = useState<{url: string, filename: string, type: string} | null>(null);
  const [modalPreview, setModalPreview] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  useEffect(() => {
    // Highlight code blocks
    // Use setTimeout to ensure DOM is fully rendered before highlighting
    const timeoutId = setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
 }, [content]);
  
  useEffect(() => {
    // Load preview when modal content changes
    if (modalContent) {
      setModalLoading(true);
      setModalPreview(null);
      
      // For images, we can directly show them
      if (modalContent.type === 'Image') {
        setModalPreview(`<img src="${modalContent.url}" alt="${modalContent.filename}" />`);
        setModalLoading(false);
      } 
      // For text files, we can try to fetch and display content
      else if (modalContent.type === 'File' || modalContent.type === 'Text') {
        fetch(modalContent.url)
          .then(response => {
            if (response.ok) {
              return response.text();
            }
            throw new Error('Failed to fetch file content');
          })
          .then(text => {
            // Check if it's a code file based on extension
            const extension = modalContent.filename.split('.').pop()?.toLowerCase();
            const codeLanguages = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'sql', 'md'];
            
            if (extension && codeLanguages.includes(extension)) {
              // Format as code with syntax highlighting
              const language = extension === 'js' || extension === 'jsx' ? 'javascript' :
                              extension === 'ts' || extension === 'tsx' ? 'typescript' :
                              extension === 'py' ? 'python' :
                              extension === 'java' ? 'java' :
                              extension === 'cpp' || extension === 'c' || extension === 'h' || extension === 'hpp' ? 'cpp' :
                              extension === 'css' ? 'css' :
                              extension === 'html' || extension === 'xml' ? 'html' :
                              extension === 'json' ? 'json' :
                              extension === 'sql' ? 'sql' :
                              extension === 'md' ? 'markdown' :
                              'plaintext';
              
              setModalPreview(`<pre><code class="language-${language}">${text}</code></pre>`);
            } else {
              // Format as plain text
              setModalPreview(`<pre>${text}</pre>`);
            }
            
            setModalLoading(false);
          })
          .catch(error => {
            console.error('Error loading file preview:', error);
            setModalLoading(false);
          });
      } 
      // For other file types, just show basic info
      else {
        setModalLoading(false);
      }
    }
  }, [modalContent]);
  
  useEffect(() => {
    // Apply syntax highlighting to modal content when it changes
    if (modalPreview) {
      // Use setTimeout to ensure DOM is fully rendered before highlighting
      const timeoutId = setTimeout(() => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
          const codeBlocks = modalBody.querySelectorAll('pre code');
          codeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
          });
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [modalPreview]);
  
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
        <div className="file-display">
          <span>File: {item.content}</span>
          <button 
            className="view-file-button"
            onClick={() => setModalContent({url: fileUrl, filename: item.content, type: item.tag || 'File'})}
          >
            View File
          </button>
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
      
      {/* File Preview Modal */}
      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalContent.filename}</h3>
              <button className="modal-close" onClick={() => setModalContent(null)}>×</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <p>Loading preview...</p>
              ) : modalPreview ? (
                <div dangerouslySetInnerHTML={{__html: modalPreview}} />
              ) : (
                <p>Preview not available for this file type.</p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="view-in-new-tab-button"
                onClick={() => window.open(modalContent.url, '_blank')}
              >
                Open in New Tab
              </button>
              <button 
                className="download-button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = modalContent.url;
                  link.download = modalContent.filename;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;

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
  
  useEffect(() => {
    // Highlight code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);
  
  const renderContent = (item: ContentItem) => {
    if (item.type === 'link') {
      return (
        <a href={item.content} target="_blank" rel="noopener noreferrer">
          {item.content}
        </a>
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
        <pre className="code-content">
          <code className={item.language ? `language-${item.language}` : ''}>
            {item.content}
          </code>
        </pre>
      );
    } else {
      return <span className="text-content">{item.content}</span>;
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
              {item.tag && <span className={`tag ${item.tag}`}>{item.tag}</span>}
              {renderContent(item)}
              <span className="timestamp">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
              </span>
              {(item.type === 'text' || item.type === 'link' || item.type === 'code') && (
                <button 
                  className="copy-button" 
                  onClick={() => copyToClipboard(item.content, item.id)}
                  aria-label="Copy to clipboard"
                >
                  {copiedItemId === item.id ? 'Copied!' : 'Copy'}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentDisplay;

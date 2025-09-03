import React, { useState } from 'react';

interface ContentItem {
  id: number;
  type: string;
  content: string;
  filename?: string;
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
    } else {
      return <span>{item.content}</span>;
    }
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
              {renderContent(item)}
              <span className="timestamp">
                {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
              </span>
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

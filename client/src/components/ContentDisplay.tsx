import React from 'react';

interface ContentItem {
  id: number;
  type: string;
  content: string;
  filename?: string;
  timestamp?: string;
}

interface ContentDisplayProps {
  content: ContentItem[];
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content }) => {
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
  
  return (
    <div className="content-display">
      <h2>Recent Content</h2>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentDisplay;

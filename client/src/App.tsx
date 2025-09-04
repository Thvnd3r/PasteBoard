import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ContentDisplay from './components/ContentDisplay';
import ContentInput from './components/ContentInput';
import FileUpload from './components/FileUpload';
import './styles/App.css';

const socket = io();

function App() {
  const [content, setContent] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('new'); // new, text, files, view-all
  
  useEffect(() => {
    // Fetch initial content
    fetch('/api/content')
      .then(response => response.json())
      .then(data => setContent(data))
      .catch(error => console.error('Error fetching content:', error));
    
    // Listen for new content
    socket.on('contentAdded', (newContent) => {
      setContent(prevContent => [newContent, ...prevContent]);
    });
    
    // Listen for deleted content
    socket.on('contentDeleted', (deletedContent) => {
      setContent(prevContent => prevContent.filter(item => item.id !== deletedContent.id));
    });
    
    // Listen for all content deleted
    socket.on('allContentDeleted', () => {
      setContent([]);
    });
    
    // Clean up socket connection
    return () => {
      socket.off('contentAdded');
      socket.off('contentDeleted');
      socket.off('allContentDeleted');
    };
  }, []);
  
  const deleteContentItem = async (id: number) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      // Update local state
      setContent(prevContent => prevContent.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };
  
  const deleteAllContent = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete all content');
      }
      
      // Update local state
      setContent([]);
    } catch (error) {
      console.error('Error deleting all content:', error);
    }
  };
  
  const renderActiveView = () => {
    switch (activeView) {
      case 'text':
        return (
          <ContentDisplay 
            content={content.filter(item => item.type === 'text' || item.type === 'link' || item.type === 'code')} 
            onDeleteItem={deleteContentItem}
            onDeleteAll={deleteAllContent}
          />
        );
      case 'files':
        return (
          <ContentDisplay 
            content={content.filter(item => item.type === 'file')} 
            onDeleteItem={deleteContentItem}
            onDeleteAll={deleteAllContent}
          />
        );
      case 'view-all':
        return (
          <ContentDisplay 
            content={content} 
            onDeleteItem={deleteContentItem}
            onDeleteAll={deleteAllContent}
          />
        );
      case 'new':
      default:
        return (
          <div className="new-page">
            <div className="input-section">
              <h2>Text/Links</h2>
              <ContentInput socket={socket} />
            </div>
            <div className="file-upload">
              <h2>Files</h2>
              <FileUpload socket={socket} />
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>PasteBoard</h1>
          <p className="tagline">Share text, images and links on your local network</p>
        </div>
      </header>
      
      <nav className="sidebar">
        <button 
          className={activeView === 'new' ? 'active' : ''} 
          onClick={() => setActiveView('new')}
        >
          New
        </button>
        <button 
          className={activeView === 'text' ? 'active' : ''} 
          onClick={() => setActiveView('text')}
        >
          Text/Links
        </button>
        <button 
          className={activeView === 'files' ? 'active' : ''} 
          onClick={() => setActiveView('files')}
        >
          Files
        </button>
        <button 
          className={activeView === 'view-all' ? 'active' : ''} 
          onClick={() => setActiveView('view-all')}
        >
          View All
        </button>
      </nav>
      
      <main className="App-main">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;

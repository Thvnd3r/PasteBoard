import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ContentDisplay from './components/ContentDisplay';
import ContentInput from './components/ContentInput';
import FileUpload from './components/FileUpload';
import './styles/App.css';

const socket = io();

function App() {
  const [content, setContent] = useState<any[]>([]);
  
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
    
    // Clean up socket connection
    return () => {
      socket.off('contentAdded');
    };
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>PasteBoard</h1>
      </header>
      <main className="App-main">
        <div className="input-section">
          <ContentInput socket={socket} />
          <FileUpload socket={socket} />
        </div>
        <div className="content-section">
          <ContentDisplay content={content} />
        </div>
      </main>
    </div>
  );
}

export default App;

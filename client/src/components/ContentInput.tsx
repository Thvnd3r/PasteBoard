import React, { useState } from 'react';

interface ContentInputProps {
  socket: any;
}

const ContentInput: React.FC<ContentInputProps> = ({ socket }) => {
  const [inputText, setInputText] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    try {
      const response = await fetch('/api/content/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputText }),
      });
      
      if (response.ok) {
        setInputText('');
      } else {
        console.error('Failed to submit content');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
    }
  };
  
  return (
    <div className="content-input">
      <h2>Paste Text</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text or URL here..."
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit">Paste</button>
      </form>
    </div>
  );
};

export default ContentInput;

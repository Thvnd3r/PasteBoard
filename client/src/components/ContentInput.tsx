import React, { useState } from 'react';

interface ContentInputProps {
  socket: any;
}

const ContentInput: React.FC<ContentInputProps> = ({ socket }) => {
  const [inputText, setInputText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
        setSuccessMessage('Text successfully pasted!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        console.error('Failed to submit content');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
    }
  };
  
  return (
    <div className="content-input-simple">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your text or URL here..."
        rows={2}
        cols={25}
      />
      <br />
      <button onClick={handleSubmit}>Paste</button>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default ContentInput;

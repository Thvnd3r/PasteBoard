import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  socket: any;
}

const FileUpload: React.FC<FileUploadProps> = ({ socket }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
 }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  }, []);
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles.length) return;
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('file', file));
    try {
      const response = await fetch('/api/content/file', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSuccessMessage('Files successfully uploaded!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        console.error('Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  
  return (
    <div className="file-upload-simple">
      <div 
        className={`drop-zone-simple ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag and drop files here</p>
        {selectedFiles.length > 0 && (
          <div className="file-name-display">
            Selected files: {selectedFiles.map(f => f.name).join(', ')}
          </div>
        )}
        <button type="button" onClick={handleBrowseClick}>Browse</button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <button onClick={handleSubmit} disabled={selectedFiles.length === 0}>
        Upload
      </button>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default FileUpload;

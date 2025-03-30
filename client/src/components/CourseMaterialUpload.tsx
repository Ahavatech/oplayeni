import React, { useState } from 'react';
import './CourseMaterialUpload.css';

interface CourseMaterialUploadProps {
  courseId: string;
  materialType: string;
  onUploadComplete?: () => void;
  onClose?: () => void;
}

export const CourseMaterialUpload: React.FC<CourseMaterialUploadProps> = ({
  courseId,
  materialType,
  onUploadComplete,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set a default title based on the file name (without extension)
      const defaultTitle = file.name.replace(/\.[^/.]+$/, '');
      setTitle(defaultTitle);
      console.log('Selected file:', file); // Debug log
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('courseId', courseId);
    formData.append('materialType', materialType);

    // Debug log
    console.log('Uploading:', {
      file: selectedFile.name,
      title,
      courseId,
      materialType
    });

    try {
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-modal">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">File</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          {onClose && (
            <button type="button" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
          )}
          <button type="submit" className="primary" disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
}; 
import React, { useState } from "react";

interface FileUploaderProps {
    courseId: string;
    materialType: 'notes' | 'tutorial' | 'assignment';
    onUploadComplete?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ courseId, materialType, onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            // Check file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'image/jpeg',
                'image/png'
            ];
            
            if (!allowedTypes.includes(selectedFile.type)) {
                setMessage("Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, JPG, or PNG files.");
                return;
            }
            setFile(selectedFile);
            setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", materialType);
        formData.append("title", file.name);

        setUploading(true);
        setMessage("");

        try {
            const response = await fetch(`/api/courses/${courseId}/materials/upload`, {
                method: "POST",
                body: formData,
                credentials: "include",
                headers: {
                    "Accept": "application/json", // Ensure server knows it's JSON
                }
            });            

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.details || "Upload failed");
            }

            setMessage("File uploaded successfully!");
            if (onUploadComplete) {
                onUploadComplete();
            }
            setFile(null);
            // Reset the file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-uploader">
            <h2>Upload {materialType}</h2>
            <div className="upload-form">
                <label htmlFor="file-upload">Choose file:</label>
                <input 
                    type="file" 
                    id="file-upload"
                    name="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    aria-label={`Choose ${materialType} file to upload`}
                />
                <button 
                    onClick={handleUpload} 
                    disabled={uploading || !file}
                    className="upload-button"
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </div>
            {message && (
                <p className={message.includes("Error") ? "error-message" : "success-message"}>
                    {message}
                </p>
            )}
            <div className="debug-info" style={{ display: 'none' }}>
                <p>Course ID: {courseId}</p>
                <p>Material Type: {materialType}</p>
                <p>File: {file?.name}</p>
            </div>
        </div>
    );
};

export default FileUploader;

import React from 'react';

interface CourseMaterialProps {
    material: {
        _id: string;
        title: string;
        type: 'notes' | 'tutorial' | 'assignment';
        url: string;
        uploadDate: string;
    };
}

const CourseMaterial: React.FC<CourseMaterialProps> = ({ material }) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/materials/${material._id}/download`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get the filename from the Content-Disposition header if available
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = material.title;
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download the file. Please try again.');
        }
    };

    return (
        <div className="course-material">
            <div className="material-info">
                <h3>{material.title}</h3>
                <p>Type: {material.type}</p>
                <p>Uploaded: {new Date(material.uploadDate).toLocaleDateString()}</p>
            </div>
            <button 
                onClick={handleDownload}
                className="download-button"
            >
                Download
            </button>
        </div>
    );
};

export default CourseMaterial; 
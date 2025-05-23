
import React, { useCallback, useState } from 'react';
import { UPLOAD_ICON } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  // Fix: Changed React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement>
  const handleDrag = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Fix: Changed React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement>
  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  }, [onFileSelect]);


  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <label
        htmlFor="pdf-upload"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            {UPLOAD_ICON}
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF files only (max 10MB recommended)</p>
        </div>
        <input
          id="pdf-upload"
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
      {isLoading && <p className="text-sm text-primary-600 mt-2 text-center">Processing PDF...</p>}
    </div>
  );
};

export default FileUpload;
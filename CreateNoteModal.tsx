
import React, { useState, useCallback, useRef } from 'react';
import { APP_LOGO_ICON, CLOSE_ICON_SVG, APP_UPLOAD_ICON } from './constants'; // Ensure APP_UPLOAD_ICON is defined

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleDrag = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-note-modal-title"
    >
      <div 
        className="bg-slate-800 text-slate-100 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {React.cloneElement(APP_LOGO_ICON, {className: "w-6 h-6 sm:w-7 sm:h-7 text-slate-300"})}
            <h2 id="create-note-modal-title" className="text-lg sm:text-xl font-semibold text-slate-200">Add PDF Source</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            {CLOSE_ICON_SVG}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <p className="text-slate-300 mb-6 text-sm">
            OpenNotebook uses the content of your PDF to provide summaries, answer questions, and generate podcast scripts.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full p-6 sm:p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                        ${dragActive ? "border-primary-500 bg-slate-700" : "border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700"}`}
            onClick={openFileDialog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openFileDialog()}
            aria-label="Upload area: Click or drag and drop a PDF file"
          >
            <div className="text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                {React.cloneElement(APP_UPLOAD_ICON, {className: "w-10 h-10 sm:w-12 sm:h-12 text-slate-500"})}
              </div>
              <p className="mb-1 text-md sm:text-lg font-semibold text-slate-200">Upload PDF</p>
              <p className="text-xs sm:text-sm text-slate-400">
                Drag and drop or <span className="font-semibold text-primary-400 hover:text-primary-300">choose file</span> to upload
              </p>
            </div>
            <input
              ref={inputRef}
              id="modal-pdf-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Supported file types: PDF
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;
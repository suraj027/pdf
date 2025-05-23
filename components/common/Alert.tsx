
import React from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = "p-4 rounded-md flex items-start";
  const typeClasses = {
    error: "bg-red-100 text-red-700",
    success: "bg-green-100 text-green-700",
    info: "bg-blue-100 text-blue-700",
  };

  const Icon: React.FC<{ type: AlertProps['type'] }> = ({ type }) => {
    if (type === 'error') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    }
    // Add other icons for success/info if needed
    return null;
  };


  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <Icon type={type} />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="ml-4 p-1 -m-1 text-current hover:opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
    
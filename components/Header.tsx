
import React, { useRef } from 'react';

interface HeaderProps {
  onFileUpload: (file: File) => void;
  showColumns: boolean;
  setShowColumns: (show: boolean) => void;
  hasSchema: boolean;
  fileName: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onFileUpload, showColumns, setShowColumns, hasSchema, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-3 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v4c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
        </svg>
        <h1 className="text-xl font-bold text-gray-200">ServiceNow ERD Viewer</h1>
        {fileName && <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">{fileName}</span>}
      </div>
      <div className="flex items-center gap-6">
        {hasSchema && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Show Details</span>
            <button
              onClick={() => setShowColumns(!showColumns)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                showColumns ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showColumns ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".json"
        />
        <button
          onClick={handleUploadClick}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 9.414V13H5.5z" />
            <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
          </svg>
          {hasSchema ? 'Upload New' : 'Upload Schema'}
        </button>
      </div>
    </header>
  );
};

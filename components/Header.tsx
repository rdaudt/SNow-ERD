
import React, { useRef, useState } from 'react';
import { LayoutType, LineShape, LineShapeOption } from '../types';
import { getLayoutOptions } from '../services/layoutEngine';

interface TableInfo {
  id: string;
  name: string;
}

interface HeaderProps {
  onFileUpload: (file: File) => void;
  showColumns: boolean;
  setShowColumns: (show: boolean) => void;
  hasSchema: boolean;
  fileName: string | null;
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  allTables: TableInfo[];
  selectedTableIds: Set<string>;
  onTableSelectionChange: (tableIds: Set<string>) => void;
  lineShape: LineShape;
  onLineShapeChange: (lineShape: LineShape) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onFileUpload,
  showColumns,
  setShowColumns,
  hasSchema,
  fileName,
  currentLayout,
  onLayoutChange,
  allTables,
  selectedTableIds,
  onTableSelectionChange,
  lineShape,
  onLineShapeChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showLineShapeMenu, setShowLineShapeMenu] = useState(false);
  const layoutOptions = getLayoutOptions();

  const lineShapeOptions: LineShapeOption[] = [
    { value: 'straight', label: 'Straight', description: 'Direct lines between tables' },
    { value: 'orthogonal', label: 'Orthogonal', description: 'Right-angle connections (default)' },
    { value: 'curved', label: 'Curved', description: 'Smooth curved lines' }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTableToggle = (tableId: string) => {
    const newSelection = new Set(selectedTableIds);
    if (newSelection.has(tableId)) {
      newSelection.delete(tableId);
    } else {
      newSelection.add(tableId);
    }
    onTableSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = new Set(allTables.map(t => t.id));
    onTableSelectionChange(allIds);
  };

  const handleDeselectAll = () => {
    onTableSelectionChange(new Set());
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
          <>
            {/* Table Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTableSelector(!showTableSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  Tables ({selectedTableIds.size}/{allTables.length})
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showTableSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTableSelector(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
                    {/* Header with Select All / Deselect All */}
                    <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-200">Select Tables</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSelectAll}
                          className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleDeselectAll}
                          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Scrollable table list */}
                    <div className="overflow-y-auto p-2">
                      {allTables.map(table => (
                        <label
                          key={table.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTableIds.has(table.id)}
                            onChange={() => handleTableToggle(table.id)}
                            className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-200 flex-1">{table.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="text-sm font-medium">
                  {layoutOptions.find(opt => opt.value === currentLayout)?.label || 'Layout'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showLayoutMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLayoutMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {layoutOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onLayoutChange(option.value);
                            setShowLayoutMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded transition-colors ${
                            currentLayout === option.value
                              ? 'bg-cyan-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className={`text-xs mt-0.5 ${
                            currentLayout === option.value ? 'text-cyan-100' : 'text-gray-500'
                          }`}>
                            {option.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Line Shape Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLineShapeMenu(!showLineShapeMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
                <span className="text-sm font-medium">
                  {lineShapeOptions.find(opt => opt.value === lineShape)?.label || 'Line Shape'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showLineShapeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLineShapeMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                      {lineShapeOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onLineShapeChange(option.value);
                            setShowLineShapeMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded transition-colors ${
                            lineShape === option.value
                              ? 'bg-cyan-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className={`text-xs mt-0.5 ${
                            lineShape === option.value ? 'text-cyan-100' : 'text-gray-500'
                          }`}>
                            {option.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

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
          </>
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

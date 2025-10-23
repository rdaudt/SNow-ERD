
import React from 'react';
import { DataDictionaryEntry } from '../types';

interface TableMetadataPopupProps {
  metadata: DataDictionaryEntry;
  x: number;
  y: number;
}

export const TableMetadataPopup: React.FC<TableMetadataPopupProps> = ({ metadata, x, y }) => {
  return (
    <div
      className="absolute bg-gray-800 border-2 border-purple-500 rounded-lg shadow-2xl p-4 z-50 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        minWidth: '320px',
        maxWidth: '500px'
      }}
    >
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-purple-300 font-semibold">Name: </span>
          <span className="text-gray-100">{metadata.table_name}</span>
        </div>
        <div>
          <span className="text-purple-300 font-semibold">Label: </span>
          <span className="text-gray-100">{metadata.table_label}</span>
        </div>
        <div>
          <span className="text-purple-300 font-semibold">Record count: </span>
          <span className="text-gray-100">{metadata.record_count.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-purple-300 font-semibold">Description: </span>
          <span className="text-gray-100">{metadata.description}</span>
        </div>
      </div>
    </div>
  );
};

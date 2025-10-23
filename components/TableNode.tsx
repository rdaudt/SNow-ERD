
import React, { forwardRef } from 'react';
import { TableNodeData, Column as ColumnType } from '../types';

interface TableNodeProps {
  data: TableNodeData;
}

const Column: React.FC<{ col: ColumnType }> = ({ col }) => (
  <div className="flex items-center justify-between text-sm px-3 py-1 truncate">
    <div className="flex items-center gap-2 truncate">
      {col.isPk && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
        </svg>
      )}
      {col.isFk && !col.isPk && (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10.392A7.968 7.968 0 005.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10.392c1.057.514 2.245.804 3.5.804 1.255 0 2.443-.29 3.5-.804V4.804A7.968 7.968 0 0014.5 4z" />
        </svg>
      )}
      <span className={`truncate ${col.isPk ? 'font-semibold text-black' : 'text-black'}`}>{col.name}</span>
    </div>
    <span className="text-black font-mono text-xs">{col.type}</span>
  </div>
);


export const TableNode = forwardRef<HTMLDivElement, TableNodeProps>(({ data }, ref) => {
  const showColumns = data.height > 80;

  return (
    <div
      ref={ref}
      className="absolute bg-white border border-gray-400 rounded-lg shadow-2xl w-72 cursor-move transition-all duration-200 ease-in-out"
      style={{
        left: data.x,
        top: data.y,
        height: `${data.height}px`,
        willChange: 'transform'
      }}
    >
        <div className="h-full flex flex-col">
            <div className="bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-400 flex-shrink-0">
                <h3 className="font-bold text-black text-center truncate">{data.name}</h3>
            </div>

            {showColumns && (
                <div className="overflow-y-auto flex-grow">
                    {data.pkColumns.length > 0 && (
                        <div className="py-1">
                            {data.pkColumns.map(col => <Column key={col.name} col={col} />)}
                        </div>
                    )}
                    
                    {data.pkColumns.length > 0 && data.otherColumns.length > 0 && (
                         <hr className="border-gray-400 mx-2" />
                    )}

                    {data.otherColumns.length > 0 && (
                        <div className="py-1">
                            {data.otherColumns.map(col => <Column key={col.name} col={col} />)}
                        </div>
                    )}
                </div>
            )}
            
            {!showColumns && (
                 <div className="flex-grow flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                 </div>
            )}
        </div>
    </div>
  );
});

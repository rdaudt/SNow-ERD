import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ERDViewer } from './components/ERDViewer';
import { Schema, RawSchema } from './types';
import { parseSchema, recalculateNodeHeights } from './services/schemaParser';

const App: React.FC = () => {
  const [rawSchema, setRawSchema] = useState<RawSchema | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [showColumns, setShowColumns] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (!text) {
          throw new Error("File is empty or could not be read.");
        }
        const json = JSON.parse(text) as RawSchema;
        if (!json.tables || !json.relationship_index) {
          throw new Error('Invalid JSON format. Missing "tables" or "relationship_index" key.');
        }
        setRawSchema(json);
        const parsedSchema = parseSchema(json);
        setSchema(parsedSchema);
        setFileName(file.name);
        setError(null);
      } catch (err) {
        if (err instanceof SyntaxError && 'message' in err && text) {
            let errorMessage = `Error parsing file: ${err.message}`;

            // Try to extract position from the error message. V8 (Chrome, Node) provides this.
            const positionMatch = err.message.match(/position (\d+)/);
            
            if (positionMatch) {
                try {
                    const position = parseInt(positionMatch[1], 10);

                    // Calculate line and column from the character position
                    let line = 1;
                    let lastNewline = -1;
                    for (let i = 0; i < position; i++) {
                        if (text[i] === '\n') {
                            line++;
                            lastNewline = i;
                        }
                    }
                    const column = position - lastNewline;

                    const lines = text.split('\n');
                    const errorLineIndex = line - 1;
                    const contextLines = 2; // Number of lines to show before and after the error

                    const startLine = Math.max(0, errorLineIndex - contextLines);
                    const endLine = Math.min(lines.length, errorLineIndex + contextLines + 1);

                    const lineNumPadding = String(endLine).length;

                    // Create snippet with line numbers
                    const snippetLines = lines.slice(startLine, endLine).map((content, index) => {
                        const currentLine = startLine + index + 1;
                        return `${String(currentLine).padStart(lineNumPadding, ' ')} | ${content}`;
                    });

                    // Create and insert the pointer line
                    const pointerLine = `${' '.repeat(lineNumPadding)} | ${' '.repeat(column - 1)}^`;
                    const pointerIndexInSnippet = errorLineIndex - startLine;
                    snippetLines.splice(pointerIndexInSnippet + 1, 0, pointerLine);
                    
                    errorMessage += `\n\n[File Content Near Error (line ${line}, column ${column})]\n${snippetLines.join('\n')}`;
                } catch (e) {
                    // Fallback if snippet generation fails for any reason
                    errorMessage += `\n\n(Could not generate file snippet for error position.)`;
                }
            }
            setError(errorMessage);
        } else {
             setError(err instanceof Error ? `Error: ${err.message}`: 'An unknown error occurred while parsing the file.');
        }
        setSchema(null);
        setRawSchema(null);
        setFileName(null);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
    }
    reader.readAsText(file);
  }, []);

  useEffect(() => {
      if(schema && rawSchema){
          const newNodes = recalculateNodeHeights(schema.nodes, rawSchema, showColumns);
          setSchema(prev => prev ? {...prev, nodes: newNodes} : null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showColumns, rawSchema]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header
        onFileUpload={handleFileUpload}
        showColumns={showColumns}
        setShowColumns={setShowColumns}
        hasSchema={!!schema}
        fileName={fileName}
      />
      <main className="flex-grow relative overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-800 border border-red-600 text-white p-4 rounded-lg shadow-2xl z-50 w-full max-w-4xl">
            <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="font-bold text-lg">Error</h3>
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-red-900/50 p-3 rounded mt-2">{error}</pre>
                </div>
            </div>
          </div>
        )}
        {schema ? (
          <ERDViewer schema={schema} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7v4c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold">ERD Viewer</h2>
              <p className="mt-2">Please upload a schema JSON file to begin.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
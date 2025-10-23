
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TableNodeData, RelationshipLinkData, Schema } from '../types';
import { TableNode } from './TableNode';
import { RelationshipLine } from './RelationshipLine';

declare const d3: any;

export const ERDViewer: React.FC<{ schema: Schema }> = ({ schema }) => {
  const [nodes, setNodes] = useState<TableNodeData[]>(schema.nodes);
  const [transform, setTransform] = useState(() => d3.zoomIdentity);
  const viewerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const zoomBehaviorRef = useRef<any>(null);

  const nodesMap = useMemo(() => {
    return new Map(nodes.map(node => [node.id, node]));
  }, [nodes]);

  useEffect(() => {
    setNodes(schema.nodes);
  }, [schema.nodes]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        setTransform(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    d3.select(viewerRef.current).call(zoom);
  }, []);

  const handleZoomIn = () => {
    if (viewerRef.current && zoomBehaviorRef.current) {
      d3.select(viewerRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current && zoomBehaviorRef.current) {
      d3.select(viewerRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1 / 1.3);
    }
  };

  const handleZoomReset = () => {
    if (viewerRef.current && zoomBehaviorRef.current) {
      d3.select(viewerRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  useEffect(() => {
    nodeRefs.current.forEach((ref, id) => {
      const node = nodesMap.get(id);
      if (!node) return;

      const drag = d3.drag()
        .on('start', (event: any) => {
          event.sourceEvent.stopPropagation();
        })
        .on('drag', (event: any) => {
          setNodes(currentNodes =>
            currentNodes.map(n =>
              n.id === id ? { ...n, x: n.x + event.dx / transform.k, y: n.y + event.dy / transform.k } : n
            )
          );
        });

      d3.select(ref).call(drag);
    });
  }, [nodes, transform.k, nodesMap]);

  return (
    <div ref={viewerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-grid relative">
       <style>{`.bg-grid { background-color: white; background-image: radial-gradient(circle, #d1d5db 1px, rgba(0, 0, 0, 0) 1px); background-size: 20px 20px; }`}</style>
      <div
        className="relative w-full h-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0'
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full"
          style={{ width: '10000px', height: '10000px' }} // Large SVG to contain all lines
        >
          <defs>
            <marker
              id="crow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            </marker>
             <marker
              id="one"
              viewBox="0 0 10 10"
              refX="1"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
               <path d="M 0 0 L 0 10" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            </marker>
          </defs>
          {schema.links.map(link => {
            const sourceNode = nodesMap.get(link.source);
            const targetNode = nodesMap.get(link.target);
            if (!sourceNode || !targetNode) return null;
            return <RelationshipLine key={link.id} sourceNode={sourceNode} targetNode={targetNode} link={link} />;
          })}
        </svg>

        {nodes.map(node => (
          <TableNode
            ref={el => {
                if (el) nodeRefs.current.set(node.id, el);
                else nodeRefs.current.delete(node.id);
            }}
            key={node.id}
            data={node}
          />
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-200 group"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <div className="h-px bg-gray-700"></div>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-200 group"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <div className="h-px bg-gray-700"></div>
        <button
          onClick={handleZoomReset}
          className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-200 group"
          title="Reset Zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <div className="h-px bg-gray-700"></div>
        <div className="px-2 py-1 text-xs text-gray-400 text-center font-mono">
          {Math.round(transform.k * 100)}%
        </div>
      </div>
    </div>
  );
};

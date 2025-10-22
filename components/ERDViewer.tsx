
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

    d3.select(viewerRef.current).call(zoom);
  }, []);

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
    <div ref={viewerRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-grid">
       <style>{`.bg-grid { background-image: radial-gradient(circle, #374151 1px, rgba(0, 0, 0, 0) 1px); background-size: 20px 20px; }`}</style>
      <div
        className="relative w-full h-full"
        style={{ transform: transform.toString(), transformOrigin: '0 0' }}
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
    </div>
  );
};

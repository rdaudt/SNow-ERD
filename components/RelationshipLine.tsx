
import React, { useMemo } from 'react';
import { TableNodeData, RelationshipLinkData } from '../types';

interface RelationshipLineProps {
  sourceNode: TableNodeData;
  targetNode: TableNodeData;
  link: RelationshipLinkData;
}

interface Point {
  x: number;
  y: number;
}

// Helper to find the intersection of a line with a rectangle's boundary
const getIntersectionPoint = (rect: TableNodeData, externalPoint: Point): Point => {
    const { x, y, width, height } = rect;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const dx = externalPoint.x - cx;
    const dy = externalPoint.y - cy;
    
    if (dx === 0 && dy === 0) {
        return {x: cx, y: cy};
    }

    const tan_phi = dy / dx;
    const tan_theta = height / width;

    let border_x, border_y;

    if (Math.abs(tan_phi) < tan_theta) {
        // Intersects with left or right side
        border_x = cx + (dx > 0 ? width / 2 : -width / 2);
        border_y = cy + tan_phi * (border_x - cx);
    } else {
        // Intersects with top or bottom side
        border_y = cy + (dy > 0 ? height / 2 : -height / 2);
        border_x = cx + (border_y - cy) / tan_phi;
    }
    
    return { x: border_x, y: border_y };
};


export const RelationshipLine: React.FC<RelationshipLineProps> = ({ sourceNode, targetNode, link }) => {
    
  const points = useMemo(() => {
    const sourceCenter = { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 };
    const targetCenter = { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 };

    const start = getIntersectionPoint(sourceNode, targetCenter);
    const end = getIntersectionPoint(targetNode, sourceCenter);
    
    return { start, end };
  }, [sourceNode, targetNode]);

  const { start, end } = points;
  
  // Create a simple orthogonal path (elbow connector)
  const pathData = `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
  
  // Use crow's foot for 'many-to-one' on the 'from' side (source)
  // And a single tick for the 'one' side (target)
  const markerStart = link.cardinality === 'many-to-one' ? "url(#crow)" : "url(#one)";
  const markerEnd = "url(#one)";

  return (
    <g>
      <path
        d={pathData}
        stroke="#6b7280"
        strokeWidth="1.5"
        fill="none"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
    </g>
  );
};

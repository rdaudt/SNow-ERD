
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

const TABLE_HEADER_HEIGHT = 48;
const COLUMN_HEIGHT = 24;
const TABLE_PADDING_HEIGHT = 8;

// Helper to calculate the Y position of a specific column within a table
const getColumnYPosition = (node: TableNodeData, columnName: string): number => {
  let yOffset = node.y + TABLE_HEADER_HEIGHT + TABLE_PADDING_HEIGHT;

  // Check if column is in PK section
  const pkIndex = node.pkColumns.findIndex(col => col.name === columnName);
  if (pkIndex !== -1) {
    yOffset += pkIndex * COLUMN_HEIGHT + COLUMN_HEIGHT / 2;
    return yOffset;
  }

  // Check if column is in other columns section
  const otherIndex = node.otherColumns.findIndex(col => col.name === columnName);
  if (otherIndex !== -1) {
    // Add height of PK section if it exists
    if (node.pkColumns.length > 0) {
      yOffset += node.pkColumns.length * COLUMN_HEIGHT + TABLE_PADDING_HEIGHT + 8; // 8 for separator
    }
    yOffset += otherIndex * COLUMN_HEIGHT + COLUMN_HEIGHT / 2;
    return yOffset;
  }

  // Fallback to center if column not found
  return node.y + node.height / 2;
};

// Helper to get the edge point on the left or right side of a table at a specific Y position
const getEdgePoint = (node: TableNodeData, yPosition: number, targetX: number): Point => {
  const nodeCenterX = node.x + node.width / 2;

  // Determine if target is to the left or right
  if (targetX < nodeCenterX) {
    // Connect from left edge
    return { x: node.x, y: yPosition };
  } else {
    // Connect from right edge
    return { x: node.x + node.width, y: yPosition };
  }
};


export const RelationshipLine: React.FC<RelationshipLineProps> = ({ sourceNode, targetNode, link }) => {

  const points = useMemo(() => {
    // Calculate Y positions for the specific columns
    const sourceY = getColumnYPosition(sourceNode, link.fromColumn);
    const targetY = getColumnYPosition(targetNode, link.toColumn);

    // Get the edge points based on relative positions
    const start = getEdgePoint(sourceNode, sourceY, targetNode.x + targetNode.width / 2);
    const end = getEdgePoint(targetNode, targetY, sourceNode.x + sourceNode.width / 2);

    return { start, end };
  }, [sourceNode, targetNode, link.fromColumn, link.toColumn]);

  const { start, end } = points;

  // Create an orthogonal path with better routing
  // Add some horizontal offset from the table edges for cleaner appearance
  const horizontalOffset = 30;

  let pathData: string;

  // Determine if we're going left-to-right or right-to-left
  const startExtendX = start.x < sourceNode.x + sourceNode.width / 2
    ? start.x - horizontalOffset
    : start.x + horizontalOffset;

  const endExtendX = end.x < targetNode.x + targetNode.width / 2
    ? end.x - horizontalOffset
    : end.x + horizontalOffset;

  // Create a path with three segments: horizontal, vertical, horizontal
  pathData = `M ${start.x} ${start.y} L ${startExtendX} ${start.y} L ${startExtendX} ${(start.y + end.y) / 2} L ${endExtendX} ${(start.y + end.y) / 2} L ${endExtendX} ${end.y} L ${end.x} ${end.y}`;

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

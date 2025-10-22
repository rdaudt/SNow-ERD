import dagre from 'dagre';
import { TableNodeData, RelationshipLinkData, LayoutType } from '../types';

const TABLE_WIDTH = 288;
const TABLE_HEIGHT_ESTIMATE = 200; // Average height for layout calculation
const NODE_SPACING = 150;
const RANK_SPACING = 200;

interface LayoutNode {
  id: string;
  width: number;
  height: number;
}

interface LayoutEdge {
  source: string;
  target: string;
}

/**
 * Apply a layout algorithm to position nodes
 */
export const applyLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[],
  layoutType: LayoutType
): TableNodeData[] => {
  switch (layoutType) {
    case 'grid':
      return applyGridLayout(nodes);
    case 'hierarchic':
    case 'top-down':
      return applyHierarchicalLayout(nodes, links, 'TB');
    case 'left-right':
      return applyHierarchicalLayout(nodes, links, 'LR');
    case 'orthogonal':
      return applyOrthogonalLayout(nodes, links);
    case 'organic':
      return applyOrganicLayout(nodes, links);
    case 'circular':
      return applyCircularLayout(nodes, links);
    case 'star':
      return applyStarLayout(nodes, links);
    case 'relationship-paths':
      return applyRelationshipPathsLayout(nodes, links);
    case 'smart-organic':
      return applySmartOrganicLayout(nodes, links);
    default:
      return applyGridLayout(nodes);
  }
};

/**
 * Grid Layout - Original 5-column grid
 */
const applyGridLayout = (nodes: TableNodeData[]): TableNodeData[] => {
  const TABLES_PER_ROW = 5;
  const GAP_X = 150;
  const GAP_Y = 100;

  return nodes.map((node, index) => ({
    ...node,
    x: (index % TABLES_PER_ROW) * (TABLE_WIDTH + GAP_X),
    y: Math.floor(index / TABLES_PER_ROW) * (400 + GAP_Y),
  }));
};

/**
 * Hierarchical Layout - Uses dagre for top-down or left-right flow
 */
const applyHierarchicalLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[],
  direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB'
): TableNodeData[] => {
  const g = new dagre.graphlib.Graph();

  // Configure the graph
  g.setGraph({
    rankdir: direction,
    nodesep: NODE_SPACING,
    ranksep: RANK_SPACING,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes
  nodes.forEach(node => {
    g.setNode(node.id, {
      width: node.width,
      height: node.height,
    });
  });

  // Add edges
  links.forEach(link => {
    g.setEdge(link.source, link.target);
  });

  // Run the layout
  dagre.layout(g);

  // Apply positions
  return nodes.map(node => {
    const positioned = g.node(node.id);
    return {
      ...node,
      x: positioned.x - node.width / 2,
      y: positioned.y - node.height / 2,
    };
  });
};

/**
 * Orthogonal Layout - Grid-aligned with relationship consideration
 */
const applyOrthogonalLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  // Use dagre with specific settings for orthogonal appearance
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'TB',
    nodesep: 200,
    ranksep: 250,
    ranker: 'tight-tree',
  });

  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    g.setNode(node.id, {
      width: node.width,
      height: node.height,
    });
  });

  links.forEach(link => {
    g.setEdge(link.source, link.target);
  });

  dagre.layout(g);

  // Snap to grid for orthogonal appearance
  const GRID_SIZE = 50;
  return nodes.map(node => {
    const positioned = g.node(node.id);
    return {
      ...node,
      x: Math.round((positioned.x - node.width / 2) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((positioned.y - node.height / 2) / GRID_SIZE) * GRID_SIZE,
    };
  });
};

/**
 * Organic Layout - Force-directed with natural clustering
 */
const applyOrganicLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  // Simple force-directed layout simulation
  const iterations = 100;
  const repulsion = 50000;
  const attraction = 0.01;
  const damping = 0.9;

  // Initialize with random positions
  const positions = nodes.map((node, i) => ({
    id: node.id,
    x: Math.random() * 2000,
    y: Math.random() * 2000,
    vx: 0,
    vy: 0,
  }));

  // Build adjacency for faster lookup
  const posMap = new Map(positions.map(p => [p.id, p]));

  // Simulate
  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    positions.forEach(p => {
      p.vx = 0;
      p.vy = 0;
    });

    // Repulsive forces (all pairs)
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i];
        const p2 = positions[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        p1.vx -= fx;
        p1.vy -= fy;
        p2.vx += fx;
        p2.vy += fy;
      }
    }

    // Attractive forces (edges)
    links.forEach(link => {
      const p1 = posMap.get(link.source);
      const p2 = posMap.get(link.target);
      if (p1 && p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const force = attraction;
        p1.vx += dx * force;
        p1.vy += dy * force;
        p2.vx -= dx * force;
        p2.vy -= dy * force;
      }
    });

    // Apply velocities with damping
    positions.forEach(p => {
      p.x += p.vx * damping;
      p.y += p.vy * damping;
    });
  }

  // Find bounds and normalize
  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return nodes.map(node => {
    const pos = posMap.get(node.id);
    return {
      ...node,
      x: pos ? pos.x - minX + 100 : 0,
      y: pos ? pos.y - minY + 100 : 0,
    };
  });
};

/**
 * Circular Layout - Arranges nodes in a circle
 */
const applyCircularLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  const centerX = 1500;
  const centerY = 1000;
  const radius = Math.max(400, nodes.length * 50);

  // Try to find a central node (most connected)
  const connections = new Map<string, number>();
  links.forEach(link => {
    connections.set(link.source, (connections.get(link.source) || 0) + 1);
    connections.set(link.target, (connections.get(link.target) || 0) + 1);
  });

  // Sort nodes by connectivity
  const sortedNodes = [...nodes].sort((a, b) => {
    const connA = connections.get(a.id) || 0;
    const connB = connections.get(b.id) || 0;
    return connB - connA;
  });

  return sortedNodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle) - node.width / 2,
      y: centerY + radius * Math.sin(angle) - node.height / 2,
    };
  });
};

/**
 * Star Layout - Central node with others radiating outward
 */
const applyStarLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  if (nodes.length === 0) return nodes;

  // Find the most connected node as center
  const connections = new Map<string, number>();
  links.forEach(link => {
    connections.set(link.source, (connections.get(link.source) || 0) + 1);
    connections.set(link.target, (connections.get(link.target) || 0) + 1);
  });

  let centralNode = nodes[0];
  let maxConnections = 0;
  nodes.forEach(node => {
    const conn = connections.get(node.id) || 0;
    if (conn > maxConnections) {
      maxConnections = conn;
      centralNode = node;
    }
  });

  const centerX = 1500;
  const centerY = 1000;
  const radius = 600;

  return nodes.map(node => {
    if (node.id === centralNode.id) {
      return {
        ...node,
        x: centerX - node.width / 2,
        y: centerY - node.height / 2,
      };
    }

    const otherNodes = nodes.filter(n => n.id !== centralNode.id);
    const index = otherNodes.findIndex(n => n.id === node.id);
    const angle = (2 * Math.PI * index) / otherNodes.length;

    return {
      ...node,
      x: centerX + radius * Math.cos(angle) - node.width / 2,
      y: centerY + radius * Math.sin(angle) - node.height / 2,
    };
  });
};

/**
 * Relationship Paths Layout - Optimized for relationship clarity
 */
const applyRelationshipPathsLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  // Use hierarchical layout with optimizations for reducing edge crossings
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: 'TB',
    nodesep: 180,
    ranksep: 220,
    ranker: 'network-simplex', // Better for minimizing edge crossings
    align: 'UL',
  });

  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    g.setNode(node.id, {
      width: node.width,
      height: node.height,
    });
  });

  // Weight edges to prioritize shorter paths
  links.forEach((link, idx) => {
    g.setEdge(link.source, link.target, { weight: 1 });
  });

  dagre.layout(g);

  return nodes.map(node => {
    const positioned = g.node(node.id);
    return {
      ...node,
      x: positioned.x - node.width / 2,
      y: positioned.y - node.height / 2,
    };
  });
};

/**
 * Smart Organic Layout - Advanced organic with clustering
 */
const applySmartOrganicLayout = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): TableNodeData[] => {
  // Enhanced force-directed with clustering
  const iterations = 150;
  const repulsion = 60000;
  const attraction = 0.015;
  const damping = 0.85;

  // Detect clusters based on connectivity
  const clusters = detectClusters(nodes, links);

  // Initialize with cluster-aware positions
  const positions = nodes.map((node, i) => {
    const clusterId = clusters.get(node.id) || 0;
    const clusterAngle = (2 * Math.PI * clusterId) / Math.max(1, clusters.size);
    const clusterRadius = 800;
    const baseX = 1500 + clusterRadius * Math.cos(clusterAngle);
    const baseY = 1000 + clusterRadius * Math.sin(clusterAngle);

    return {
      id: node.id,
      x: baseX + (Math.random() - 0.5) * 400,
      y: baseY + (Math.random() - 0.5) * 400,
      vx: 0,
      vy: 0,
      cluster: clusters.get(node.id) || 0,
    };
  });

  const posMap = new Map(positions.map(p => [p.id, p]));

  // Simulate with cluster awareness
  for (let iter = 0; iter < iterations; iter++) {
    positions.forEach(p => {
      p.vx = 0;
      p.vy = 0;
    });

    // Repulsive forces
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i];
        const p2 = positions[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;

        // Stronger repulsion between different clusters
        const clusterFactor = p1.cluster === p2.cluster ? 1 : 1.5;
        const force = (repulsion * clusterFactor) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        p1.vx -= fx;
        p1.vy -= fy;
        p2.vx += fx;
        p2.vy += fy;
      }
    }

    // Attractive forces
    links.forEach(link => {
      const p1 = posMap.get(link.source);
      const p2 = posMap.get(link.target);
      if (p1 && p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;

        // Stronger attraction within same cluster
        const clusterFactor = p1.cluster === p2.cluster ? 1.5 : 1;
        const force = attraction * clusterFactor * dist;
        p1.vx += (dx / dist) * force;
        p1.vy += (dy / dist) * force;
        p2.vx -= (dx / dist) * force;
        p2.vy -= (dy / dist) * force;
      }
    });

    // Apply velocities
    positions.forEach(p => {
      p.x += p.vx * damping;
      p.y += p.vy * damping;
    });
  }

  // Normalize positions
  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return nodes.map(node => {
    const pos = posMap.get(node.id);
    return {
      ...node,
      x: pos ? pos.x - minX + 100 : 0,
      y: pos ? pos.y - minY + 100 : 0,
    };
  });
};

/**
 * Detect clusters in the graph using simple connected components
 */
const detectClusters = (
  nodes: TableNodeData[],
  links: RelationshipLinkData[]
): Map<string, number> => {
  const clusters = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  // Build adjacency list
  nodes.forEach(node => adjacency.set(node.id, new Set()));
  links.forEach(link => {
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  });

  let clusterId = 0;
  const visited = new Set<string>();

  // DFS to find connected components
  const dfs = (nodeId: string, cluster: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    clusters.set(nodeId, cluster);

    const neighbors = adjacency.get(nodeId);
    if (neighbors) {
      neighbors.forEach(neighbor => dfs(neighbor, cluster));
    }
  };

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, clusterId);
      clusterId++;
    }
  });

  return clusters;
};

/**
 * Get available layout options
 */
export const getLayoutOptions = () => [
  { value: 'grid' as const, label: 'Grid', description: 'Simple 5-column grid layout' },
  { value: 'hierarchic' as const, label: 'Hierarchic', description: 'Clear top-down flow for tree structures' },
  { value: 'top-down' as const, label: 'Top-Down', description: 'Hierarchical with main entity at top' },
  { value: 'left-right' as const, label: 'Left-Right', description: 'Hierarchical flowing left to right' },
  { value: 'orthogonal' as const, label: 'Orthogonal', description: 'Grid-aligned with minimal crossings' },
  { value: 'organic' as const, label: 'Organic', description: 'Natural clustering of related entities' },
  { value: 'circular' as const, label: 'Circular', description: 'Entities arranged in a circle' },
  { value: 'star' as const, label: 'Star', description: 'Central entity with others radiating out' },
  { value: 'relationship-paths' as const, label: 'Relationship Paths', description: 'Optimized for clear relationship paths' },
  { value: 'smart-organic' as const, label: 'Smart Organic', description: 'Advanced organic with cluster detection' },
];

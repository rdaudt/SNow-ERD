
import { RawSchema, TableNodeData, RelationshipLinkData, Schema, RawTable, Column } from '../types';

const TABLE_WIDTH = 288; // w-72
const TABLE_HEADER_HEIGHT = 48;
const COLUMN_HEIGHT = 24;
const TABLE_PADDING_HEIGHT = 8;
const MIN_TABLE_HEIGHT = 80;

const GAP_X = 150;
const GAP_Y = 100;
const TABLES_PER_ROW = 5;

const calculateTableHeight = (table: RawTable, showColumns: boolean): number => {
  if (!showColumns) {
    return MIN_TABLE_HEIGHT;
  }
  const pkCount = table.columns.filter(c => c.is_pk).length;
  const otherCount = table.columns.filter(c => !c.is_pk).length;
  const totalColumns = pkCount + otherCount;
  
  // Header + PK section padding + Other section padding + columns
  let height = TABLE_HEADER_HEIGHT + (TABLE_PADDING_HEIGHT * 2) + (totalColumns * COLUMN_HEIGHT);
  if(pkCount > 0) {
      height += 8; // Separator height
  }

  return Math.max(height, MIN_TABLE_HEIGHT);
};


export const parseSchema = (rawSchema: RawSchema): Schema => {
  const nodes: TableNodeData[] = rawSchema.tables.map((table, index) => {
    const pkColumns: Column[] = table.columns
      .filter(c => c.is_pk)
      .map(c => ({ name: c.column_name, type: c.data_type, isPk: true, isFk: !!c.is_fk }));

    const otherColumns: Column[] = table.columns
      .filter(c => !c.is_pk)
      .map(c => ({ name: c.column_name, type: c.data_type, isPk: false, isFk: !!c.is_fk }));
      
    const x = (index % TABLES_PER_ROW) * (TABLE_WIDTH + GAP_X);
    const y = Math.floor(index / TABLES_PER_ROW) * (400 + GAP_Y);

    return {
      id: table.table_name,
      name: table.table_name,
      pkColumns,
      otherColumns,
      x,
      y,
      width: TABLE_WIDTH,
      height: calculateTableHeight(table, true), // default to show columns
    };
  });

  const links: RelationshipLinkData[] = rawSchema.relationship_index.map((rel, index) => {
    // Find the column to get cardinality info
    const fromTable = rawSchema.tables.find(t => t.table_name === rel.from_table);
    const fromColumn = fromTable?.columns.find(c => c.column_name === rel.from_column);

    // Find the target column (typically the primary key of the target table)
    const toTable = rawSchema.tables.find(t => t.table_name === rel.to_table);
    const toColumn = toTable?.columns.find(c => c.is_pk);

    return {
      id: `link-${index}-${rel.from_table}-${rel.to_table}`,
      source: rel.from_table,
      target: rel.to_table,
      fromColumn: rel.from_column,
      toColumn: toColumn?.column_name || '',
      toTable: rel.to_table,
      cardinality: fromColumn?.fk_cardinality || null,
    }
  });

  return { nodes, links };
};

export const recalculateNodeHeights = (nodes: TableNodeData[], rawSchema: RawSchema, showColumns: boolean): TableNodeData[] => {
    return nodes.map(node => {
        const rawTable = rawSchema.tables.find(t => t.table_name === node.name);
        if (!rawTable) return node;
        return {
            ...node,
            height: calculateTableHeight(rawTable, showColumns)
        }
    })
}

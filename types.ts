
export interface RawColumn {
  column_name: string;
  data_type: string;
  is_pk: boolean;
  is_fk: string | boolean;
  fk_cardinality: string | null;
  references_table: string | null;
}

export interface RawRelationship {
  from_table: string;
  from_column: string;
  to_table: string;
  type: string;
}

export interface RawTable {
  table_name: string;
  columns: RawColumn[];
  relationships: RawRelationship[];
}

export interface RawSchema {
  tables: RawTable[];
  relationship_index: RawRelationship[];
}

export interface Column {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
}

export interface TableNodeData {
  id: string;
  name: string;
  pkColumns: Column[];
  otherColumns: Column[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RelationshipLinkData {
  id: string;
  source: string;
  target: string;
  fromColumn: string;
  toTable: string;
  cardinality: string | null;
}

export interface Schema {
  nodes: TableNodeData[];
  links: RelationshipLinkData[];
}

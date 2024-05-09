export interface ITableRowConfig {
  [tableDataId: number | string]: {
    state?: 'confirmed-row' | 'canceled-row';
    selectable?: boolean;
    title?: string;
  };
}

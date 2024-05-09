export interface ITableDataRow<TableData> {
  type: TableRowType.Data;
  dataGroupIndex: number;
  dataIndex: number;
  data: TableData;
}

export enum TableRowType {
  Data = 'Data',
}

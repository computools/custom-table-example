import { ComponentType } from '@angular/cdk/overlay';
import { TemplateRef } from '@angular/core';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableCollapsibleConfig } from '@app/components/base-table/models/table-collapsible-config.interface';

export interface ITableConfig<TableData extends ITableData> {
  name: string | string[];
  fieldName: string;
  columns?: ITableConfig<TableData>[];
  dialog?: (data: TableData) => ComponentType<unknown> | undefined;
  template?: TemplateRef<unknown> | ((data: TableData) => TemplateRef<unknown> | undefined);
  // logic
  sortable?: boolean;
  collapsible?: ITableCollapsibleConfig;
  hasFilter?: boolean;
  // data formatters
  formatter?: (val: string | number | boolean, data: TableData) => string;
  columnPrefix?: string;
  columnSuffix?: string | string[];
  dataPrefix?: string;
  // styles
  stylesConfig?: (val: any, data: TableData) => { [p: string]: unknown } | null | undefined;
  hidden?: boolean;
  colspan?: string | number;
  rowspan?: string | number;
}

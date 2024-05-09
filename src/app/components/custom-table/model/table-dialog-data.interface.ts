import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { BaseTableComponent } from '@app/components/base-table/base-table.component';

export interface ITableDialogData<T extends ITableData> {
  dt?: BaseTableComponent<T>;
  data: T;
  field: string;
  value: string | number | boolean | null | { [key: string]: string | number | boolean | null };
}

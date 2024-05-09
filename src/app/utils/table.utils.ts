import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { ObjectUtils } from '@app/utils/object.utils';

export class TableUtils {
  public static getFormattedData = <T extends ITableData>(
    data: T,
    column: ITableConfig<T> | undefined,
    field?: string
  ): string | number | boolean | null => {
    if (!column) {
      return null;
    }
    let value: string | number | boolean | null;
    if (field) {
      value = ObjectUtils.resolveFieldData(data, field);
    } else {
      value = ObjectUtils.resolveFieldData(data, column.fieldName);
    }
    if (value && column.formatter) {
      value = column.formatter(value, data);
    } else if (value && field) {
      const innerColumName = field.replace(`${column.fieldName}.`, '');
      const innerColumn = column?.columns?.find((column) => column.fieldName === innerColumName);
      if (innerColumn && innerColumn.formatter) {
        value = innerColumn.formatter(value, data);
      }
    }
    if (value === 0) {
      value = '';
    }
    return value;
  };

  public static getStylesConfig = <T extends ITableData>(
    data: T,
    column: ITableConfig<T> | undefined,
    field?: string
  ): { [p: string]: unknown } | null | undefined => {
    if (!column || !column.stylesConfig) {
      return null;
    }
    let value: string | number | boolean | null;
    if (field) {
      value = ObjectUtils.resolveFieldData(data, field);
    } else {
      value = ObjectUtils.resolveFieldData(data, column.fieldName);
    }
    let styles: { [p: string]: unknown } | null | undefined;
    if (value && column.stylesConfig) {
      styles = column.stylesConfig(value, data);
    } else if (value && field) {
      const innerColumName = field.replace(`${column.fieldName}.`, '');
      const innerColumn = column?.columns?.find((column) => column.fieldName === innerColumName);
      if (innerColumn && innerColumn.stylesConfig) {
        styles = innerColumn.stylesConfig(value, data);
      }
    }
    return styles;
  };

  public static findColumnByFieldName = <TableData extends ITableData>(
    columns: ITableConfig<TableData>[],
    field: string
  ): ITableConfig<TableData> | undefined => {
    const matchColumn = columns.find((column) => column.fieldName && field.includes(column.fieldName));
    if (matchColumn?.columns?.length) {
      return matchColumn?.columns.find((innerColumn) => innerColumn.fieldName && field.includes(innerColumn.fieldName));
    }
    return matchColumn;
  };
}

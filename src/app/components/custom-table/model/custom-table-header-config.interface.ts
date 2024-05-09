import { ITableCollapsibleConfig } from '@app/components/base-table/models/table-collapsible-config.interface';

export interface ICustomTableHeaderConfig {
  name: string | string[];
  colspan?: string | number;
  sticky?: { left: number };
  collapsible?: ITableCollapsibleConfig;
  suffix?: string | string[];
}

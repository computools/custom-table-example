export interface ITableCollapsibleConfig {
  id: string;
  fromColumn?: number;
  toColumn?: number;
  position: 'header';
  collapsedByDefault?: boolean;
  totalLabelPrefix?: string;
  totalLabel?: string | number;
}
